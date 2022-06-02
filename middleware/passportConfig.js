const bcrypt = require("bcryptjs")
const localStrategy = require("passport-local").Strategy

const db = require("../database/database")


module.exports = function (passport) {
  const getUserQuery = 'select * from user where email = $1'
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

  passport.serializeUser(function(user, done) {
    done(null, user)
  })
  
  passport.deserializeUser(function(user, done) {
    done(null, user)
  })
}
