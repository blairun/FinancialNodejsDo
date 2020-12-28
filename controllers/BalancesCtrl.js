require('dotenv').config()
const axios = require('axios').default
// const { Balance, Plaid } = require('../models')
const sqlSend = require('./sqlSend')
const { updateBalances } = require('../scripts/updateBalances')
const { userPlaidAccounts } = require('./PlaidsCtrl')
const balanceError = require('../scripts/plaidError')

module.exports = {
  async current(req, res) {
    // latest balance data (including missing plaid data that was inserted from metatdata table)
    let sql = `select
        *
      from
        public."Balances" as b
      inner join (
        select
          i."AccountID",
          max(i."RetrievalDate") as "Latest"
        from
          public."Balances" as i
        group by
          i."AccountID") as boo on
        b."AccountID" = boo."AccountID"
        and b."RetrievalDate" = boo."Latest"
      inner join public."AccountMeta" as am on
        am."AccountID" = b."AccountID"
      where
        b."UserID" = ${req.user.dataValues.id}`

    await sqlSend(res, sql, 'current balances')
  },

  async dates(req, res) {
    // all balance dates
    let sql = `select
        distinct b."RetrievalDate"
      from
        public."Balances" b 
      where
        b."UserID" = ${req.user.dataValues.id}`

    await sqlSend(res, sql, 'balance dates')
  },

  async all(req, res) {
    // all balance data
    let sql = `select
        *
      from
        public."Balances" b
      inner join public."AccountMeta" am on
        am."AccountID" = b."AccountID"
      where
        b."UserID" = ${req.user.dataValues.id}
      order by
        b."RetrievalDate"`
    // limit date range to good values (e.g. starting Aug 20, 2020)
    //  WHERE b.RetrievalDate > "2020-08-20"`;

    await sqlSend(res, sql, 'all balances')
  },

  async date(req, res) {
    let sql =
      // selected date balance data (including missing plaid data that was inserted from metatdata table)
      `select
          *
        from
          public."Balances" as b
        inner join (
          select
            i."AccountID",
            max(i."RetrievalDate") as "Latest"
          from
            public."Balances" as i
          where
            i."RetrievalDate" = ?
          group by
            i."AccountID") as boo on
          b."AccountID" = boo."AccountID"
          and b."RetrievalDate" = boo."Latest"
        inner join public."AccountMeta" as am on
          am."AccountID" = b."AccountID"
        where
          b."UserID" = ${req.user.dataValues.id}`
    //  where RetrievalDate like '%'

    var date = [req.params.date]

    await sqlSend(res, sql, `${date} balances`, date)
  },

  async goals(req, res) {
    // goals data
    let sql = `select
        *
      from
        public."Balances" as b
      inner join (
        select
          i."AccountID",
          max(i."RetrievalDate") as "Latest"
        from
          public."Balances" as i
        group by
          i."AccountID") as boo on
        b."AccountID" = boo."AccountID"
        and b."RetrievalDate" = boo."Latest"
      inner join public."AccountMeta" as am on
        am."AccountID" = b."AccountID"
      inner join public."Goals" g on
        g."id" = am."GoalID"
      where
        b."UserID" = ${req.user.dataValues.id}`

    await sqlSend(res, sql, `goals`)
  },

  async marketData(req, res) {
    console.log(req.body.marketIndex)
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
