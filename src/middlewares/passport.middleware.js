const bcrypt = require('bcryptjs')
const localStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const executeQuery = require('../services/db.service')

module.exports = function (passport) {
  const opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
  opts.secretOrKey = process.env.JWT_SECRET

  passport.use(
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await executeQuery(
            'SELECT * FROM users WHERE email = $1',
            [email]
          )

          if (!user.rowCount) {
            return done(null, false)
          }

          const isPasswordMatch = bcrypt.compareSync(
            password,
            user.rows[0].password
          )

          return isPasswordMatch
            ? done(null, user.rows[0])
            : done(null, false, { message: 'Incorrect email or password.' })
        } catch (error) {
          return done(null, false, {
            message: 'Incorrect email or password.'
          })
        }
      }
    )
  )

  passport.use(
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const user = await executeQuery('SELECT * FROM users WHERE id = $1', [
          jwtPayload.user.id
        ])

        if (!user.rowCount) {
          return done(null, false)
        }

        return done(null, user.rows[0])
      } catch (error) {
        throw error
      }
    })
  )
}
