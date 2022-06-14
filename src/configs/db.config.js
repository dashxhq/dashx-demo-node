const { Pool } = require('pg')
const dotEnv = require('dotenv')

dotEnv.config({ path: '../../.env' })

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: true,
})

/**
 *  Execute postgresql query
 * @param  query
 * @param  values
 */

async function executeQuery(query, values) {
  try {
    return await pool.query(query, values)
  } catch (e) {
    console.log(e.stack)
  }
}

module.exports = executeQuery
