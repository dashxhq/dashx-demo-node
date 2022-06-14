const fs = require('fs')
const db = require('../configs/db.config')
const path = require('path')

const dbPath = `${path.resolve(__dirname, '..')}/configs/demo.db`

const sqlCreate = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT
);`

if (!fs.existsSync(dbPath)) {
  console.log('creating database file')
  fs.openSync(dbPath, 'w')
  db.run(sqlCreate, (err) => {
    if (err) {
      return console.error(err.message)
    }
    console.log("Successful creation of the 'user' table")
  })
}
