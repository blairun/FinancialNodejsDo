const express = require('express')
const https = require('https')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const { sequelize } = require('./models')
const config = require('./config/config')

const app = express()

// app.use(morgan('tiny'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cors())

require('./passport')
require('./routes')(app)

sequelize.sync({ force: false }).then(() => {
  // http server
  app.listen(config.port)
  console.log(`Server started on port ${config.port}`)
  console.dir(`http://localhost:${config.port}/`)
  console.dir(`http://localhost:${config.port}/balances_current`)
  console.dir(`http://localhost:${config.port}/transactions_current`)

  // https
  //   .createServer(
  //     {
  //       key: fs.readFileSync('../certs/localhost+1-key.pem'),
  //       cert: fs.readFileSync('../certs/localhost+1.pem'),
  //     },
  //     app
  //   )
  //   .listen(config.port)
  // console.dir(`https://localhost:${config.port}/`)
  // console.dir(`https://localhost:${config.port}/balances_current`)
  // console.dir(`https://localhost:${config.port}/transactions_current`)
})

// TODO look into let's encrypt for express server and localtunnel.me for secure web access to localhost

module.exports = app
