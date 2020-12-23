require('dotenv').config()
const { fetchTransactions } = require('./plaidFetch')
const transactionError = require('./plaidError')
const { sequelize } = require('../models')
const { Transaction } = require('../models')
const { QueryTypes } = require('sequelize')

// IDEA explore Plaid webhooks for realtime transaction updates
// only usable if app is published on publicly accessible server
// see ngrok or localtunnel for exposing localhost
// https://www.youtube.com/watch?v=xl6ZrCQpwM0

// IDEA use cron job to update transaction and balance data at regular intervals
// https://www.digitalocean.com/community/questions/cron-jobs-for-app-platform

const updateTransactions = async function (plaidAccounts, userId, months = 1) {
  try {
    const transactions = await fetchTransactions(plaidAccounts, userId, months)
    // console.log(transactions)

    // Pulls in last month(s) of data; prevents duplicate TransactionsIDs (check in sqlitestudio)
    // Previously done by manually setting option to constrain transactionIDs to be Unique with Replace on Conflict option
    // Currently done with via sequelize bulk insert: https://stackoverflow.com/questions/48124949/nodejs-sequelize-bulk-upsert
    // bringing in 6 months of data twice a day would have created 100+ MB / year of data without much benefit

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
    // in some cases plaid can't match pending and cleared, so you'll have to manually delete pending from db
    let sqlCleanup = `DELETE FROM Transactions
    WHERE TransactionID IN (
        SELECT t1.TransactionID
        FROM Transactions t1
        INNER JOIN
        Transactions t2 ON (t1.TransactionID = t2.PendingTransactionID) 
        WHERE t2.PendingTransactionID IS NOT NULL AND t2.UserID = ${userId})`

    await sequelize.query(sqlCleanup, {
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
