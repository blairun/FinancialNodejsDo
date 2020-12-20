require('dotenv').config({ path: '../.env' })

const { emailer } = require('./plaidFetch')

emailer('Testing 123', '💸 Ahoy there! 💸')
