require('dotenv').config()
const axios = require('axios').default
const sqlSend = require('./sqlSend')
const { updateBalances } = require('../scripts/updateBalances')
const { userPlaidAccounts } = require('./PlaidsCtrl')
const balanceError = require('../scripts/plaidError')
const c = require('../config/config')

module.exports = {
  async current(req, res) {
    // latest balance data (including missing plaid data that was inserted from metatdata table)
    let sql = c.SQL().balances_current(req.user.dataValues.id)
    await sqlSend(res, sql, 'current balances')
  },

  async dates(req, res) {
    // all balance dates
    let sql = c.SQL().balances_dates(req.user.dataValues.id)
    await sqlSend(res, sql, 'balance dates')
  },

  async all(req, res) {
    // all balance data
    let sql = c.SQL().balances_all(req.user.dataValues.id)
    await sqlSend(res, sql, 'all balances')
  },

  async date(req, res) {
    // selected date balance data (including missing plaid data that was inserted from metatdata table)
    let sql = c.SQL().balances_date(req.user.dataValues.id)
    var date = [req.params.date]
    await sqlSend(res, sql, `${date} balances`, date)
  },

  async goals(req, res) {
    // goals data
    let sql = c.SQL().balances_goals(req.user.dataValues.id)
    await sqlSend(res, sql, `goals`)
  },

  async marketData(req, res) {
    // console.log(req.body.marketIndex)
    let marketIndex = req.body.marketIndex
    // console.log(marketIndex)
    try {
      // https://api.tiingo.com/documentation/end-of-day
      let token = process.env.TIINGO_API_KEY
      const response = await axios.get(
        `https://api.tiingo.com/tiingo/daily/${marketIndex}/prices?startDate=2020-01-01&columns=close&token=${token}`
      )
      // console.log(response);
      res.json({
        message: 'success',
        data: response.data,
      })
    } catch (error) {
      console.error(error)
      res.status(400).json({ error: error })
      return
    }
  },

  async update(req, res) {
    userId = req.user.dataValues.id
    plaidEnv = req.user.dataValues.plaidEnv
    // console.log(userId)
    // console.log(plaidEnv)
    process.env.PLAID_ENV = plaidEnv

    let plaidAccounts = await userPlaidAccounts(userId)
    // console.log(plaidAccounts)

    try {
      const finished = await updateBalances(plaidAccounts, userId)
      res.send({
        message: 'success',
        data: finished,
      })
    } catch (err) {
      res.status(500).send({
        error: 'an error has occurred trying to update balances',
      })
    }
  },

  async error(req, res) {
    res.send({
      error: balanceError.err,
      publicToken: balanceError.publicToken,
    })
  },
}
