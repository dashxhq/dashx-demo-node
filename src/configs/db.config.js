const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const dbName = path.join(__dirname, 'demo.db')
const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    return console.error(err.message)
  }
  console.log('Successful connection to the database')
})

module.exports = db
