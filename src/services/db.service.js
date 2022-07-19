const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
    throw e
  }
}

module.exports = executeQuery
