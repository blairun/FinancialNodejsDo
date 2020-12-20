// const { Transaction, Plaid } = require('../models')
const sqlSend = require('./sqlSend')
const { updateTransactions } = require('../scripts/updateTransactions')
const { userPlaidAccounts } = require('./PlaidsCtrl')
const transactionError = require('../scripts/plaidError')

module.exports = {
  async current(req, res) {
    //select latest transactions info
    let sql = `SELECT *
    FROM Transactions t
         INNER JOIN
         (
             SELECT TransactionID,
                    max(RetrievalDate) AS Latest
               FROM Transactions
              GROUP BY TransactionID
         )
         tm ON t.TransactionID = tm.TransactionID AND 
               t.RetrievalDate = tm.Latest
    WHERE t.UserID = "${req.user.dataValues.id}" AND 
          t.Hide IS NULL
   ORDER BY t.TransactionDate DESC;`

    await sqlSend(res, sql, 'transactions')
  },

  async update(req, res) {
    userId = req.user.dataValues.id
    plaidEnv = req.user.dataValues.plaidEnv
    // console.log(userId);
    // console.log(plaidEnv);
    process.env.PLAID_ENV = plaidEnv

    // months to update
    months = req.body.months
    // console.log(`transactionUpdates: ${months}`)

    let plaidAccounts = await userPlaidAccounts(userId)
    // console.log(plaidAccounts)

    try {
      const finished = await updateTransactions(plaidAccounts, userId, months)
      res.send({
        message: 'success',
        data: finished,
      })
    } catch (err) {
      res.status(500).send({
        error: 'an error has occurred trying to update transactions',
      })
    }
  },

  async error(req, res) {
    res.send({
      error: transactionError.err,
      publicToken: transactionError.publicToken,
    })
  },
}
