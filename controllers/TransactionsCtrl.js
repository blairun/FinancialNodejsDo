// const { Transaction, Plaid } = require('../models')
const sqlSend = require('./sqlSend')
const { updateTransactions } = require('../scripts/updateTransactions')
const { userPlaidAccounts } = require('./PlaidsCtrl')
const transactionError = require('../scripts/plaidError')

module.exports = {
  async current(req, res) {
    //select latest transactions info
    let sql = `select
        *
      from
        public."Transactions" t
      inner join (
        select
          i."TransactionID",
          max(i."RetrievalDate") as "Latest"
        from
          public."Transactions" i
        group by
          i."TransactionID" ) as tm on
        t."TransactionID" = tm."TransactionID"
        and t."RetrievalDate" = tm."Latest"
      where
        t."UserID" = ${req.user.dataValues.id}
        and t."Hide" is null
      order by
        t."TransactionDate" desc`

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
