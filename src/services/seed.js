const executeQuery = require('../configs/db.config')

const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100)
);`

const seedDatabase = async () => {
  try {
    await executeQuery(createUsersTableQuery)
  } catch (error) {
    throw error
  }
}

seedDatabase()
