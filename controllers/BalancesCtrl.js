require('dotenv').config()
const axios = require('axios').default
// const { Balance, Plaid } = require('../models')
const sqlSend = require('./sqlSend')
const { updateBalances } = require('../scripts/updateBalances')
const { userPlaidAccounts } = require('./PlaidsCtrl')
const balanceError = require('../scripts/plaidError')

module.exports = {
  // async index(req, res) {
  //   try {
  //     let balances = null;

  //     balances = await Balance.findAll({
  //       limit: 10,
  //     });

  //     res.send(balances);
  //   } catch (err) {
  //     res.status(500).send({
  //       error: "an error has occured trying to fetch the balances",
  //     });
  //   }
  // },

  async current(req, res) {
    // latest balance data (including missing plaid data that was inserted from metatdata table)
    let sql = `SELECT *
    FROM Balances b
         INNER JOIN
         (
             SELECT AccountID,
                    max(RetrievalDate) AS Latest
               FROM Balances
              GROUP BY AccountID
         )
         bl ON b.AccountID = bl.AccountID AND 
               b.RetrievalDate = bl.Latest
         INNER JOIN
         AccountMeta am ON am.AccountID = b.AccountID
    WHERE b.UserID = "${req.user.dataValues.id}";`

    await sqlSend(res, sql, 'current balances')
  },

  async dates(req, res) {
    // all balance dates
    let sql = `SELECT DISTINCT RetrievalDate
    FROM Balances
    WHERE UserID = "${req.user.dataValues.id}";`

    await sqlSend(res, sql, 'balance dates')
  },

  async all(req, res) {
    // all balance data
    let sql = `SELECT *
    FROM Balances b
         INNER JOIN
         AccountMeta am ON am.AccountID = b.AccountID
    WHERE b.UserID = "${req.user.dataValues.id}";
    ORDER BY b.RetrievalDate;`
    // limit date range to good values (e.g. starting Aug 20, 2020)
    //  WHERE b.RetrievalDate > "2020-08-20"`;

    await sqlSend(res, sql, 'all balances')
  },

  async date(req, res) {
    let sql =
      // selected date balance data (including missing plaid data that was inserted from metatdata table)
      `SELECT *
      FROM Balances b
           INNER JOIN
           (
               SELECT AccountID,
                      max(RetrievalDate) AS Latest
                 FROM Balances
                WHERE RetrievalDate = ?
                GROUP BY AccountID
           )
           bl ON b.AccountID = bl.AccountID AND 
                 b.RetrievalDate = bl.Latest
           INNER JOIN
           AccountMeta am ON am.AccountID = b.AccountID
     WHERE b.UserID = "${req.user.dataValues.id}";`
    //  where RetrievalDate like '%'

    var date = [req.params.date]

    await sqlSend(res, sql, `${date} balances`, date)
  },

  async goals(req, res) {
    // goals data
    let sql = `SELECT *
    FROM Balances b
         INNER JOIN
         (
             SELECT AccountID,
                    max(RetrievalDate) AS Latest
               FROM Balances
              GROUP BY AccountID
         )
         bl ON b.AccountID = bl.AccountID AND 
               b.RetrievalDate = bl.Latest
         INNER JOIN
         AccountMeta am ON am.AccountID = b.AccountID
         INNER JOIN
         Goals g ON g.id = am.GoalID
    WHERE g.UserID = "${req.user.dataValues.id}";`

    await sqlSend(res, sql, `goals`)
  },

  async marketData(req, res) {
    try {
      // https://api.tiingo.com/documentation/end-of-day
      let token = process.env.TINGO_MARKET_DATA
      const response = await axios.get(
        `https://api.tiingo.com/tiingo/daily/TRRMX/prices?startDate=2020-01-01&columns=close&token=${token}`
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
    // console.log(userId);
    // console.log(plaidEnv);
    process.env.PLAID_ENV = plaidEnv

    // months to update
    months = req.body
    // console.log(months)

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
