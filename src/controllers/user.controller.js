const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const dx = require('../configs/dashx.config')
const executeQuery = require('../configs/db.config')

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

    return res.status(201).json({
      message: 'user created',
      data: {
        id: user.rows[0].id,
        first_name,
        last_name,
        email,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

const login = async (req, res) => {
  const { first_name, last_name, email, id } = req.user
  const token = jwt.sign(
    JSON.parse(
      JSON.stringify({
        first_name,
        last_name,
        email,
        id: id,
      })
    ),
    'nodeauthsecret',
    {
      expiresIn: 86400 * 30,
    }
  )

  dx.identify(id)
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

  const updateQuery =
    'update users set first_name = $1, last_name = $2, email = $3 where id = $4 returning *'
  try {
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

// const logout = async (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       res.status(500).json({message: 'something went wrong'})
//     }
//   })
//   res.status(200).json({message: 'Successfully logged out'})
// }

module.exports = { registerUser, login, updateProfile }
