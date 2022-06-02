const express = require('express')
const passport = require("passport")
const router = express.Router()

const { registerUser, login, updateProfile } = require('../controller/userController')

router.put('/register', registerUser)
router.post('/login', passport.authenticate('local'), login)
router.patch("/update", updateProfile)

module.exports = router
