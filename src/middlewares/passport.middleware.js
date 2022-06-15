const bcrypt = require('bcryptjs')
const localStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const executeQuery = require('../services/db.service')

module.exports = function (passport) {
  const getUserQuery = 'select * from users where email = $1'
  const opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
  opts.secretOrKey = 'nodeauthsecret'

  passport.use(
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await executeQuery(getUserQuery, [email])
          if (!user.rowCount) {
            return done(null, false)
          }

          bcrypt.compare(password, user.rows[0].password, (err, result) => {
            if (err) done(err)
            if (result === true) {
              return done(null, user.rows[0])
            } else {
              return done(null, false, {
                message: 'Incorrect username or password.',
              })
            }
          })
        } catch (error) {
          return done(null, false, {
            message: 'Incorrect username or password.',
          })
        }
      }
    )
  )

  passport.use(
    new JwtStrategy(opts, async function (jwtPayload, done) {
      const getUserQuery = 'select * from users where id = $1'
      try {
        const user = await executeQuery(getUserQuery, [jwtPayload.id])
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
