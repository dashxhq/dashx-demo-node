const dotEnv = require('dotenv')
const DashX = require('@dashx/node')

dotEnv.config()

// Initialize DashX SDK
const dx = DashX.default.createClient({
  baseUri: process.env.DASHX_URI,
  publicKey: process.env.DASHX_PUBLIC_KEY,
  privateKey: process.env.DASHX_PRIVATE_KEY,
})

module.exports = dx
