const express = require('express')
const passport = require('passport')

const userController = require('../controllers/user.controller')

const router = express.Router()

//routes
router.post('/register', userController.registerUser)
router.post(
  '/login',
  passport.authenticate('local', {
    session: false,
    failureRedirect: '/unauthorized'
  }),
  userController.login
)

router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  userController.getProfile
)

router.patch(
  '/update-profile',
  passport.authenticate('jwt', { session: false }),
  userController.updateProfile
)

router.get('/unauthorized', userController.unauthorizedLogin)
router.post('/forgot-password', userController.forgotPassword)
router.post('/reset-password', userController.resetPassword)
router.post('/contact', userController.contact)
router.get(
  '/post',
  passport.authenticate('jwt', { session: false }),
  userController.getPosts
)

router.post(
  '/post',
  passport.authenticate('jwt', { session: false }),
  userController.createPost
)

module.exports = router
