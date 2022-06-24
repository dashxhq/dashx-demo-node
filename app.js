const express = require('express')
const cors = require('cors')
require('dotenv').config()
const passport = require('passport')

const userRoutes = require('./src/routes/user.routes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(passport.initialize())
require('./src/middlewares/passport.middleware')(passport)

app.use('/', userRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})
