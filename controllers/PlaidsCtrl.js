require('dotenv').config()
const { Plaid, AccountMeta } = require('../models')
const { developmentClient, sandboxClient } = require('../scripts/plaidClient')
const util = require('util')
const sqlSend = require('./sqlSend')
const saveEnv = require('../scripts/saveEnv')
const transactionError = require('../scripts/plaidError')
const balanceError = require('../scripts/plaidError')

const plaidClient = function () {
  let client = developmentClient

  if (process.env.PLAID_ENV === 'sandbox') {
    client = sandboxClient
  }
  return client
}

var prettyPrintResponse = (response) => {
  console.log(util.inspect(response, { colors: true, depth: 4 }))
}

module.exports = {
  async add(req, res) {
    try {
      // exhchange public token for access token
      process.env.PLAID_ENV = req.user.dataValues.plaidEnv
      // console.log(process.env.PLAID_ENV)
      const client = plaidClient()
      client.exchangePublicToken(req.body.PlaidToken, async function (
        error,
        tokenResponse
      ) {
        if (error != null) {
          prettyPrintResponse(error)
          return response.json({
            error: error,
          })
        }
        ACCESS_TOKEN = tokenResponse.access_token
        // saveAccessToken(ACCESS_TOKEN);
        // ITEM_ID = tokenResponse.item_id;
        // prettyPrintResponse(tokenResponse)
        // response.json({
        //   access_token: ACCESS_TOKEN,
        //   item_id: ITEM_ID,
        //   error: null,
        // });
        // console.log(req.body)
        req.body.PlaidToken = ACCESS_TOKEN
        // console.log(req.body)
        const newPlaid = await Plaid.create(req.body)
        // console.log(newPlaid);
        res.send({
          message: 'success',
          // data: newPlaid,
        })
      })
    } catch (error) {
      res.status(500).send({
        error: 'an error has occured trying to add this item',
      })
    }
  },

  async update(req, res) {
    try {
      // exhchange access token for public token
      // let publicToken = await this.plaidPublicToken()
      // console.log(publicToken)
      res.send({
        message: 'success',
        data: process.env.PLAID_broken_public_token,
      })
    } catch (error) {
      res.status(500).send({
        error: 'an error has occured trying to update this item',
      })
    }
  },

  async remove(req, res) {},

  async metas(req, res) {
    // account metadata for current user
    // order items alphabetically
    let sql = `SELECT *
    FROM AccountMeta
    WHERE UserID = "${req.user.dataValues.id}" AND Closed IS NULL
    ORDER BY LOWER(Institution);`

    await sqlSend(res, sql, 'account metadata')
  },

  async metas_update(req, res) {
    // console.log(req.body)
    // array of all table fields
    // console.log(Object.keys(AccountMeta.rawAttributes))
    AccountMeta.bulkCreate(req.body, {
      updateOnDuplicate: Object.keys(AccountMeta.rawAttributes),
    })
    res.json({
      message: 'success',
      // data: response.data,
    })
  },

  async userPlaidAccounts(userId) {
    let plaid = await Plaid.findAll({
      where: { UserID: userId },
    })
    // console.log(plaid[0].dataValues);
    // console.log(plaid);
    var plaidAccounts = plaid.map(function (d, i) {
      // console.log(d.dataValues);
      return {
        id: d.dataValues.id,
        account: d.dataValues.ItemName,
        token: d.dataValues.PlaidToken,
        hide: d.dataValues.Hide,
      }
    })
    // console.log(plaidAccounts)
    return plaidAccounts
  },

  async plaidPublicToken() {
    const client = plaidClient()
    // console.log(process.env.PLAID_broken_access_token)
    return client.createPublicToken(
      process.env.PLAID_broken_access_token,
      async function (err, res) {
        if (err != null) {
          // console.log('nope')
          console.log(JSON.stringify(err))
        } else {
          // Use the public_token to initialize Link
          var PUBLIC_TOKEN = res.public_token
          // console.log(`Saving broken public token: ${PUBLIC_TOKEN}`)
          saveEnv({
            [`PLAID_broken_public_token`]: PUBLIC_TOKEN,
          })
          // console.log('Saved.')
          // console.log()
          balanceError.publicToken = PUBLIC_TOKEN
          transactionError.publicToken = PUBLIC_TOKEN
          return PUBLIC_TOKEN
        }
      }
    )
  },
}
