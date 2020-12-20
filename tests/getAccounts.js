require('dotenv').config()
const { getAccounts } = require('../scripts/plaidFetch')

let plaidAccounts = [{ account: 'chase', token: process.env.PLAID_TOKEN_chase }]
let userId = 1

getAccounts(plaidAccounts, userId)
