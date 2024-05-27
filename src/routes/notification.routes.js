const express = require('express')
const passport = require('passport')

const notificationController = require('../controllers/notification.controller')

const router = express.Router()

router.post(
  '/notification/send',
  passport.authenticate('jwt', { session: false }),
  notificationController.sendNotification
)

module.exports = router
