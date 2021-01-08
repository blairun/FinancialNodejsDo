require('dotenv').config()
const { fetchTransactions } = require('./plaidFetch')
const transactionError = require('./plaidError')
const { sequelize } = require('../models')
const { Transaction } = require('../models')
const { QueryTypes } = require('sequelize')
const c = require('../config/config')

// IDEA Plaid webhooks for realtime transaction updates
// only usable if app is published on publicly accessible server like DigitalOcean

// IDEA use cron job to update transaction and balance data at regular intervals
// https://www.digitalocean.com/community/questions/cron-jobs-for-app-platform

const updateTransactions = async function (plaidAccounts, userId, months = 1) {
  try {
    const transactions = await fetchTransactions(plaidAccounts, userId, months)
    // console.log(transactions)

    // Pulls in last month(s) of data; prevents duplicate TransactionsIDs (check in dbeaver)
    // Via sequelize bulk insert: https://stackoverflow.com/questions/48124949/nodejs-sequelize-bulk-upsert

    await Transaction.bulkCreate(transactions, {
      // updates existing rows rather than adding new rows, updates only named fields
      updateOnDuplicate: [
        'TransactionID',
        'TransactionDate',
        'Description',
        'Amount',
        'Pending',
        'PendingTransactionID',
        'RetrievalDate',
        'Category',
        'Location',
        'Merchant',
        'PaymentChannel',
        'TransactionType',
        'Hide',
      ],
      // ignores rules about duplicate primary keys
      // ignoreDuplicate: true,
    })

    // delete pending transactions that have cleared
    // in some cases plaid can't match pending and cleared,
    // so you'll have to manually delete those pending transactions from db
    let sql = c.SQL().cleanup(userId)

    await sequelize.query(sql, {
      type: QueryTypes.DELETE,
    })

    transactionError.clear()
    // console.log('transactions updated')
    return 'transactions updated'
  } catch (err) {
    console.log(err)
  }
}

// updateTransactions();

module.exports.updateTransactions = updateTransactions
