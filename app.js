const express = require('express')
const cors = require('cors')
const dotEnv = require('dotenv')
const passport = require("passport")
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const indexRoutes = require('./routes/indexRoutes')

const app = express()

dotEnv.config()
app.use(cors())
app.use(express.json())
app.use(passport.initialize())
require("./middleware/passportConfig")(passport)

app.use('/', indexRoutes)
app.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
)

app.listen(process.env.APP_PORT, () => {
  console.log(`Server listening on port ${process.env.APP_PORT}`)
})
