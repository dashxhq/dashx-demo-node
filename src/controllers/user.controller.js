const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const dx = require('../services/dashx.service')
const executeQuery = require('../services/db.service')

const registerUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body
  if (!first_name || !last_name || !email || !password) {
    return res.status(422).json({ message: 'All fields are required.' })
  }

  try {
    const {
      rows: [user]
    } = await executeQuery(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, email, bcrypt.hashSync(password, 10)]
    )

    const userData = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    }

    await dx.identify(user.id, userData)
    await dx.track('User Registered.', String(user.id), userData)

    return res.status(201).json({ message: 'User created.' })
  } catch (error) {
    if (error.constraint === 'users_email_key') {
      return res.status(409).json({ message: 'User already exists.' })
    }
    return res.status(500).json({ message: error })
  }
}

const login = async (req, res) => {
  const user = req.user
  delete user.password

  const token = jwt.sign(
    {
      user,
      dashx_token: dx.generateIdentityToken(user.id)
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 86400 * 30
    }
  )

  res.status(200).json({ message: 'User logged in.', token })
}

const updateProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    if (req.user.email !== req.body.email) {
      const existingUser = await executeQuery(
        'SELECT * FROM users WHERE email = $1',
        [req.body.email]
      )

      if (existingUser.rowCount) {
        return res.status(409).json({ message: 'Email already exist.' })
      }
    }

    const {
      rows: [user]
    } = await executeQuery(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3
       WHERE id = $4 RETURNING id, first_name, last_name, email`,
      [
        req.body.first_name || req.user.first_name,
        req.body.last_name || req.user.last_name,
        req.body.email || req.user.email,
        req.user.id
      ]
    )

    dx.identify(user.id, {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    })

    return res.status(200).json({ message: 'Profile updated.', user })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

const unauthorizedLogin = (req, res) => {
  return res.status(401).json({ message: 'Incorrect username or password.' })
}

module.exports = { registerUser, login, updateProfile, unauthorizedLogin }
