const express = require('express')
const passport = require("passport")
const router = express.Router()

const { registerUser, login, updateProfile, logout } = require('../controller/userController')

router.put('/register', registerUser)
router.post('/login', passport.authenticate('local', { session: false }), login)
router.patch("/update", passport.authenticate('jwt', { session: false}), updateProfile)

module.exports = router
