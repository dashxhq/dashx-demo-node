const bcrypt = require("bcryptjs")

const db = require('../database/database')

const registerUser = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password
  } = req.body

  const insertQuery = 'insert into user (firstname, lastname, email, password ) values(?, ?, ?, ?)'
  const getUserQuery = 'select * from user where email = ?'
  const hashedPassword = await bcrypt.hash(password, 10)
  db.get(getUserQuery, [email], (err, result) => {
    if (err) {
      return res.status(400).json({message: err})
    }

    if(result) {
      return res.status(409).json({message: 'User already exists'})
    }

    db.run(insertQuery, [firstname, lastname, email, hashedPassword], (err) => {
      if (err) {
        return res.status(400).json({message: err})
      }
      return res.status(201).json({
        message: 'user created',
        data: {
          firstname,
          lastname,
          email
        } 
      })
    })
  })
}

const login = async (req, res) => {
  const {firstname, lastname, email, user_id} = req.user
  res.status(200).json({
    message: 'user logged in',
    data: {
      userid: user_id,
      firstname,
      lastname,
      email
    }
  })
}

const updateProfile = async (req, res) => {
  if(!req.user){
    return res.status(401).json({message: 'Unauthorized'})
  }

  const updateQuery = 'update user set firstname = $1, lastname = $2, email = $3 where user_id = $4';
  db.run(updateQuery, [
    req.body.firstname || req.user.firstname,
    req.body.lastname || req.user.lastname,
    req.body.email || req.user.email,
    req.user.user_id
  ],
  (err) => {
    if(err) {
      return res.status(400).json({message: err})
    }
    return res.status(204).json({message: 'profile updated' })
  })
}

module.exports = { registerUser, login, updateProfile }
