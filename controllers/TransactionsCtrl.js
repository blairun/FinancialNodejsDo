// const { Transaction, Plaid } = require('../models')
const sqlSend = require('./sqlSend')
const { updateTransactions } = require('../scripts/updateTransactions')
const { userPlaidAccounts } = require('./PlaidsCtrl')
const transactionError = require('../scripts/plaidError')
const c = require('../config/config')

module.exports = {
  async current(req, res) {
    //select latest transactions info
    let sql = c.SQL().transactions_current(req.user.dataValues.id)
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
    // console.log(`transaction months: ${months}`)

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
