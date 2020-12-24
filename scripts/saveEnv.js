const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const envPath = path.resolve(__dirname, '../.env')

// TODO !! save all tokens to db rather than .env
module.exports = function (vars) {
  let current
  try {
    current = dotenv.parse(fs.readFileSync(envPath))
  } catch (e) {
    current = {}
  }
  Object.assign(current, vars)
  const serialize = Object.keys(current)
    .map((key) => `${key}=${current[key]}`)
    .join(`\n`)
  fs.writeFileSync(envPath, serialize)
}
