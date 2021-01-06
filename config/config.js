require('dotenv').config()
const path = require('path')
const pgSQL = require('../sql/postgres')
const slSQL = require('../sql/sqlite')

module.exports = {
  // db_postgres: process.env.DB_URL,
  db_postgres: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },

  db_sqlite: {
    database: process.env.DB_NAME || 'financial_vue',
    user: process.env.DB_USER || 'financial_vue',
    password: process.env.DB_PASS || 'financial_vue',
    dialect: process.env.DB_DIALECT || 'sqlite',
    host: process.env.HOST || 'localhost',
    storage: path.resolve(__dirname, `../${process.env.DB_ENV}.sqlite`),
    logging: false,
    options: {},
  },

  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
  },

  db() {
    // select correct database config
    // defaults to postgres unless DB_DIALECt is set to sqlite
    if (process.env.DB_DIALECT === 'sqlite') return this.db_sqlite
    return this.db_postgres
  },

  SQL() {
    // user correct sql statements
    // defaults to postgres unless DB_DIALECT is set to sqlite
    if (process.env.DB_DIALECT === 'sqlite') return slSQL
    return pgSQL
  },
}

// seed finances then set that to be archived.
// before starting forever, uncomment that
// archiver should never be able to mistakenly overwrite
// achieved by only copying files or by never having the sandboxed db named the same as production db
// just want one file in google drive, so only sandboxed db can't be named the same as production
