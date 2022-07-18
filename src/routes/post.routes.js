const express = require('express')
const passport = require('passport')

const postController = require('../controllers/post.controller')

const router = express.Router()

router.get(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.getPosts
)

router.post(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.createPost
)

router.put(
  '/posts/:post_id/toggle-bookmark',
  passport.authenticate('jwt', { session: false }),
  postController.toggleBookmark
)

router.get(
  '/posts/bookmarked',
  passport.authenticate('jwt', { session: false }),
  postController.getBookmarkedPosts
)

module.exports = router
