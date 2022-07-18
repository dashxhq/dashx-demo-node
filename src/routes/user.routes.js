const express = require('express')
const passport = require('passport')

const usersController = require('../controllers/user.controller')
const postsController = require('../controllers/post.controller')
const productsController = require('../controllers/product.controller')

const router = express.Router()

//routes
router.post('/register', usersController.registerUser)
router.post(
  '/login',
  passport.authenticate('local', {
    session: false,
    failureRedirect: '/unauthorized'
  }),
  usersController.login
)

router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  usersController.getProfile
)

router.patch(
  '/update-profile',
  passport.authenticate('jwt', { session: false }),
  usersController.updateProfile
)

router.get('/unauthorized', usersController.unauthorizedLogin)
router.post('/forgot-password', usersController.forgotPassword)
router.post('/reset-password', usersController.resetPassword)
router.post('/contact', usersController.contact)

router.get(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postsController.getPosts
)

router.post(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postsController.createPost
)

router.put(
  '/posts/:post_id/toggle_bookmark',
  passport.authenticate('jwt', { session: false }),
  postsController.toggleBookmark
)

router.get(
  '/posts/bookmarked',
  passport.authenticate('jwt', { session: false }),
  postsController.getBookmarkedPosts
)

router.get(
  '/products',
  passport.authenticate('jwt', { session: false }),
  productsController.getProducts
)

router.get(
  '/products/:slug',
  passport.authenticate('jwt', { session: false }),
  productsController.getProduct
)

module.exports = router
