const bcrypt = require("bcryptjs")
const localStrategy = require("passport-local").Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const db = require("../database/database")


module.exports = function (passport) {
  const getUserQuery = 'select * from user where email = $1'
  const opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = 'nodeauthsecret';

  passport.use(
    new localStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },(email, password, done) => {
      db.get(getUserQuery, [email], (err, user) => {
        if (err) {
         throw err
        }

        if (!user) {
          return done(null, false)
        }

        bcrypt.compare(password, user.password, (err, result) => {
          if (err) done(err)
          if (result === true) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Incorrect username or password.' })
          }
        })
      })
    })
  )

  passport.use(new JwtStrategy(opts, function(jwtPayload, done) {
    const getUserQuery = 'select * from user where user_id = $2'
    db.get(getUserQuery, [ jwtPayload.id], (err, user) => {
      if (err) {
       throw err
      }

      if (!user) {
        return done(null, false)
      }

      return done(null, user)
    })
  }))
}
