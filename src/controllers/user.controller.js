const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const dx = require('../configs/dashx.config')
const db = require('../configs/db.config')

const registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const insertQuery =
    'insert into users (first_name, last_name, email, password ) values(?, ?, ?, ?)'
  const getUserQuery = 'select * from users where email = ?'
  const hashedPassword = await bcrypt.hash(password, 10)
  db.get(getUserQuery, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err })
    }

    if (result) {
      return res.status(409).json({ message: 'User already exists' })
    }

    db.run(
      insertQuery,
      [firstname, lastname, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(500).json({ message: err })
        }

        return res.status(201).json({
          message: 'user created',
          data: {
            id: this.lastID,
            firstname,
            lastname,
            email,
          },
        })
      }
    )
  })
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
      userid: id,
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
    'update users set first_name = $1, last_name = $2, email = $3 where id = $4'
  db.run(
    updateQuery,
    [
      req.body.firstname || req.user.first_name,
      req.body.lastname || req.user.last_name,
      req.body.email || req.user.email,
      req.user.id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({ message: err })
      }

      dx.identify(req.user.id, {
        firstName: req.body.firstname || req.user.first_name,
        lastName: req.body.lastname || req.user.last_name,
        email: req.body.email || req.user.email,
      })

      return res.status(204).json({ message: 'profile updated' })
    }
  )
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
