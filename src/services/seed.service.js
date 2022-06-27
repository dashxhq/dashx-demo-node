require('dotenv').config()
const executeQuery = require('./db.service')

const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100)
);`

const seedDatabase = async () => {
  try {
    await executeQuery(createUsersTableQuery)
    console.log('Database seeded')
  } catch (error) {
    throw error
  }
}

seedDatabase()
