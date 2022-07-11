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
  '/posts',
  passport.authenticate('jwt', { session: false }),
  userController.getPosts
)

router.post(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  userController.createPost
)

router.put(
  '/posts/:post_id/bookmark',
  passport.authenticate('jwt', { session: false }),
  userController.toggleBookmark
)

router.get(
  '/bookmarks',
  passport.authenticate('jwt', { session: false }),
  userController.getBookmark
)

module.exports = router
