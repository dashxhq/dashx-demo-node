const express = require('express')
const passport = require('passport')

const productController = require('../controllers/product.controller')

const router = express.Router()

router.get(
  '/products',
  passport.authenticate('jwt', { session: false }),
  productController.getProducts
)

router.get(
  '/products/:slug',
  passport.authenticate('jwt', { session: false }),
  productController.getProduct
)

module.exports = router
