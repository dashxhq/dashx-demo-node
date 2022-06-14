const express = require('express')
const cors = require('cors')
const dotEnv = require('dotenv')
const passport = require('passport')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const userRoutes = require('./src/routes/user.routes')

const app = express()

dotEnv.config()
app.use(cors())
app.use(express.json())
app.use(passport.initialize())
require('./src/middlewares/passport.middleware')(passport)

app.use('/', userRoutes)
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(process.env.APP_PORT, () => {
  console.log(`Server listening on port ${process.env.APP_PORT}`)
})
