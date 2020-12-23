require('dotenv').config()

module.exports = {
  db: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
  },
}

// seed finances then set that to be archived.
// before starting forever, uncomment that
// archiver should never be able to mistakenly overwrite
// achieved by only copying files or by never having the sandboxed db named the same as production db
// just want one file in google drive, so only sandboxed db can't be named the same as production
