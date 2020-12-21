require('dotenv').config()
const path = require('path')

// module.exports = {
//   port: process.env.PORT || 9990,
//   db: {
//     database: process.env.DB_NAME || 'financial_vue',
//     user: process.env.DB_USER || 'financial_vue',
//     password: process.env.DB_PASS || 'financial_vue',
//     options: {
//       dialect: process.env.DIALECT || 'sqlite',
//       host: process.env.HOST || 'localhost',
//       storage: path.resolve(__dirname, `../${process.env.DB_ENV}.sqlite`),
//       logging: false,
//     },
//   },
//   authentication: {
//     jwtSecret: process.env.JWT_SECRET || 'secret',
//   },
// }

module.exports = {
  // port: process.env.PORT || 9990,
  db: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    // logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
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
