const db = require('./database/database')

const sql_create = `CREATE TABLE IF NOT EXISTS user (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password TEXT
);`

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message)
  }
  console.log("Successful creation of the 'user' table")
})
