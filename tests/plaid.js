require('dotenv').config()

const path = require('path')
const { fetchTransactions } = require('../scripts/plaidFetch')
const { fetchAllBalances } = require('../scripts/plaidFetch')

;(async () => {
  const res = await fetchTransactions()
  console.log('Transactions fetch successful!')
  console.log(res)

  // const res = await fetchAllBalances()
  // console.log('Balances fetch successful!')
  // console.log(res)
})()
