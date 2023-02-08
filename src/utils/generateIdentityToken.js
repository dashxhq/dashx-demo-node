const jwt = require('jsonwebtoken')

const generateIdentityToken = (uid) => {
  const hmacSecret = process.env.DASHX_PRIVATE_KEY

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Token expires at 1 Week from now

  const payload = {
    kind: 'USER',
    uid: uid.toString(),
    exp: Math.floor(expiresAt.getTime() / 1000)
  }

  return jwt.sign(payload, hmacSecret)
}

module.exports = generateIdentityToken
