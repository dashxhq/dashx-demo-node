const express = require('express')
const passport = require('passport')

const userController = require('../controllers/user.controller')

const router = express.Router()

router.put('/register', userController.registerUser)
router.post(
  '/login',
  passport.authenticate('local', {
    session: false,
    failureRedirect: '/unauthorized'
  }),
  userController.login
)

router.patch(
  '/update-profile',
  passport.authenticate('jwt', { session: false }),
  userController.updateProfile
)

router.get('/unauthorized', userController.unauthorizedLogin)

module.exports = router
