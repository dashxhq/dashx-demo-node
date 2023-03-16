const { Pool } = require('pg')
const fs = require('fs')

require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

var sql = fs.readFileSync('db/setup.sql').toString()

pool.query(sql, function (err) {
  if (err) {
    console.log('error: ', err)
    process.exit(1)
  }

  process.exit(0)
})
