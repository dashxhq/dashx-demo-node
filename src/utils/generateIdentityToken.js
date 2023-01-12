const jwt = require("jsonwebtoken");

const generateIdentityToken = (kind, uid, user) => {
  const hmacSecret = process.env.DASHX_PRIVATE_KEY

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const userPayload = {
    kind,
    uid,
    user,
    exp: Math.floor(expiresAt.getTime() / 1000)
  }

  return jwt.sign(userPayload, hmacSecret)
}

module.exports = generateIdentityToken
