const express = require('express')
const passport = require('passport')
const router = express.Router()

const {
  registerUser,
  login,
  updateProfile,
} = require('../controllers/user.controller')

router.put('/register', registerUser)
router.post('/login', passport.authenticate('local', { session: false }), login)
router.patch(
  '/update-profile',
  passport.authenticate('jwt', { session: false }),
  updateProfile
)

module.exports = router
