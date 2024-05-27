const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const dx = require('../services/dashx.service')

const sendNotification = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  try {
    await dx.deliver('in_app/forgot-password', {
      content: {
        to: `account_uid:${req.user.id}`,
        ...req.body
      }
    })
  } catch(err) {
    console.log({ err })
  }

  try {
    return res.status(200).json({ message: 'Successfully sent notification.' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error })
  }
}

module.exports = { sendNotification }
