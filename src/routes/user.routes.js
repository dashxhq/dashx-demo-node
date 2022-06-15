const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const router = express.Router()

const dx = require('../services/dashx.service')
const executeQuery = require('../services/db.service')

// handlers
const registerUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const insertQuery =
    'insert into users (first_name, last_name, email, password ) values($1, $2, $3, $4) returning *'
  const getUserQuery = 'select * from users where email = $1'
  const hashedPassword = await bcrypt.hash(password, 10)
  try {
    const existingUser = await executeQuery(getUserQuery, [email])
    if (existingUser.rowCount) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const user = await executeQuery(insertQuery, [
      first_name,
      last_name,
      email,
      hashedPassword,
    ])

    const userData = {
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      email: user.rows[0].email,
    }

    await dx.identify(user.rows[0].id, userData)
    await dx.track('User Registered', String(user.rows[0].id), userData)
    return res.status(201).json({
      message: 'user created',
    })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

const login = async (req, res) => {
  const { first_name, last_name, email, id } = req.user
  const dashxToken = dx.generateIdentityToken(id)
  const token = jwt.sign(
    JSON.parse(
      JSON.stringify({
        first_name,
        last_name,
        email,
        id,
        session: {
          id,
          dashxToken,
        },
      })
    ),
    'nodeauthsecret',
    {
      expiresIn: 86400 * 30,
    }
  )

  res.status(200).json({
    message: 'user logged in',
    data: {
      id: id,
      first_name,
      last_name,
      email,
      token,
    },
  })
}

const updateProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const getUserQuery = 'select * from users where email = $1'
  const updateQuery =
    'update users set first_name = $1, last_name = $2, email = $3 where id = $4 returning *'
  try {
    if (req.user.email !== req.body.email) {
      const existingUser = await executeQuery(getUserQuery, [req.body.email])
      if (existingUser.rowCount) {
        return res.status(409).json({ message: 'Email already exist' })
      }
    }

    const user = await executeQuery(updateQuery, [
      req.body.first_name || req.user.first_name,
      req.body.last_name || req.user.last_name,
      req.body.email || req.user.email,
      req.user.id,
    ])

    dx.identify(user.rows[0].id, {
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      email: user.rows[0].email,
    })

    return res.status(204).json({ message: 'profile updated' })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

const unauthorizedLogin = (req, res) => {
  return res.status(401).json({ message: 'Incorrect username or password' })
}

//routes
router.put('/register', registerUser)
router.post(
  '/login',
  passport.authenticate('local', {
    session: false,
    failureRedirect: '/unauthorized',
  }),
  login
)

router.patch(
  '/update-profile',
  passport.authenticate('jwt', { session: false }),
  updateProfile
)

router.get('/unauthorized', unauthorizedLogin)

module.exports = router
