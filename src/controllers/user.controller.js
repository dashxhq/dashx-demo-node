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
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    }

    await dx.identify(user.id, userData)
    await dx.track('User Registered', user.id, userData)

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
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    })

    return res.status(200).json({ message: 'Profile updated.', user })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

const unauthorizedLogin = (req, res) => {
  return res.status(401).json({ message: 'Incorrect email or password.' })
}

const forgotPassword = async (req, res) => {
  if (!req.body.email.trim()) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  try {
    const users = await executeQuery('SELECT * FROM users WHERE email = $1', [
      req.body.email
    ])
    const user = users.rows[0]

    if (!user) {
      return res
        .status(404)
        .json({ message: 'This email does not exist in our records.' })
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    })

    await dx.deliver('email/forgot-password', {
      to: user.email,
      data: { token }
    })

    return res.status(200).json({
      message: 'Check your inbox for a link to reset your password.'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error })
  }
}

const contact = async (req, res) => {
  const { name, email, feedback } = req.body
  if (!name || !email || !feedback) {
    return res.status(422).json({ message: 'All fields are required.' })
  }

  try {
    await dx.deliver('email', {
      content: {
        name: 'Contact us',
        from: 'noreply@dashxdemo.com',
        to: [email, 'sales@dashx.com'],
        subject: 'Contact Us Form',
        html_body: `
          <mjml>
            <mj-body>
              <mj-section>
                <mj-column>
                  <mj-divider border-color="#F45E43"></mj-divider>
                  <mj-text>Thanks for reaching out! We will get back to you soon!</mj-text>
                  <mj-text>Your feedback: </mj-text>
                  <mj-text>Name: ${name}</mj-text>
                  <mj-text>Email: ${email}</mj-text>
                  <mj-text>Feedback: ${feedback}</mj-text>
                  <mj-divider border-color="#F45E43"></mj-divider>
                </mj-column>
              </mj-section>
            </mj-body>
          </mjml>`
      }
    })

    return res.status(200).json({
      message: 'Thanks for reaching out! We will get back to you soon.'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error })
  }
}

const resetPassword = async (req, res) => {
  if (!req.body.token) {
    return res.status(400).json({ message: 'Token is required.' })
  }

  if (!req.body.password) {
    return res.status(400).json({ message: 'Password is required.' })
  }

  try {
    const jwtPayload = jwt.verify(req.body.token, process.env.JWT_SECRET)

    const { rowCount } = await executeQuery(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id',
      [bcrypt.hashSync(req.body.password, 10), jwtPayload.email]
    )

    if (!rowCount) {
      return res.status(422).json({ message: 'Invalid reset password link.' })
    }

    return res.status(200).json({
      message: 'You have successfully reset your password.'
    })
  } catch (error) {
    if (error.name == 'TokenExpiredError') {
      return res
        .status(422)
        .json({ message: 'Your reset password link has expired.' })
    }
    return res.status(500).json({ message: error })
  }
}

const getProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    const {
      rows: [user]
    } = await executeQuery(
      `SELECT id, first_name, last_name, email FROM users
       WHERE id = $1`,
      [req.user.id]
    )

    return res.status(200).json({ message: 'Successfully fetched.', user })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

const createPost = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    const {
      rows: [post]
    } = await executeQuery(
      'INSERT INTO posts (user_id, text) VALUES ($1, $2) RETURNING *',
      [req.user.id, req.body.text]
    )

    return res.status(200).json({ message: 'Successfully created post.', post })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}

const getPosts = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  const values = [req.user.id, req.body.limit || 5]
  let str = ''

  if (req.body.post_id) {
    values.push(req.body.post_id)
    str = 'AND posts.id < $3'
  }

  try {
    const { rows } = await executeQuery(
      `SELECT posts.*, first_name, last_name, email FROM posts INNER JOIN users ON posts.user_id = users.id WHERE users.id = $1 ${str} ORDER BY posts.created_at DESC LIMIT $2`,
      values
    )

    return res.status(200).json({ posts: rows })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error })
  }
}

module.exports = {
  registerUser,
  login,
  getProfile,
  updateProfile,
  unauthorizedLogin,
  forgotPassword,
  contact,
  resetPassword,
  createPost,
  getPosts
}
