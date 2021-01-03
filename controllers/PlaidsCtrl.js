require('dotenv').config()
const { Plaid, AccountMeta } = require('../models')
const { developmentClient, sandboxClient } = require('../scripts/plaidClient')
const util = require('util')
const sqlSend = require('./sqlSend')
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
      // exchange public token for access token
      process.env.PLAID_ENV = req.user.dataValues.plaidEnv
      // console.log(process.env.PLAID_ENV)
      const client = plaidClient()
      client.exchangePublicToken(
        req.body.PlaidToken,
        async function (error, tokenResponse) {
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
        }
      )
    } catch (error) {
      res.status(500).send({
        error: 'an error has occurred trying to add this item',
      })
    }
  },

  async update(req, res) {
    try {
      // exchange access token for public token
      // let publicToken = await this.plaidPublicToken()
      // console.log(publicToken)
      res.send({
        message: 'success',
        data: process.env.PLAID_broken_public_token,
      })
    } catch (error) {
      res.status(500).send({
        error: 'an error has occurred trying to update this item',
      })
    }
  },

  async remove(req, res) {
    id = req.body.plaidId
    institution = req.body.accountName
    // console.log(id)
    if (id) {
      try {
        // destroy only works if cascade on delete is set for all affected tables
        await Plaid.destroy({ where: { id: id } })
        // hide plaid record
        // await Plaid.update({ Hide: true }, { where: { id: id } })
        // console.log('Removed Plaid Id ' + id)
        res.send({
          message: 'success',
        })
      } catch (e) {
        let err = 'Error during Plaid Item deletion'
        // console.log(err)
        console.log(e)
        res.status(500).send({
          error: err,
        })
      }
    } else {
      console.log('No Plaid Id specified')
      console.log('Trying to delete other Account data')
      try {
        // destroy only works if cascade on delete is set for all affected tables
        await AccountMeta.destroy({ where: { Institution: institution } })
        res.send({
          message: 'success',
        })
      } catch (e) {
        let err = 'Error during AccountMeta Item deletion'
        // console.log(err)
        console.log(e)
        res.status(500).send({
          error: err,
        })
      }
    }
  },

  async metas(req, res) {
    // account metadata for current user
    // order items alphabetically
    let sql = `select
        *
      from
        public."AccountMeta" as am
      where
        am."UserID" = ${req.user.dataValues.id}
        order by
        LOWER(am."Institution")`
    // and am."Closed" is null

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
      // console.log(d.dataValues)
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

  async plaidPublicToken(brokenAccessToken) {
    const client = plaidClient()
    return client.createPublicToken(
      brokenAccessToken,
      await function (err, res) {
        if (err != null) {
          // console.log('nope')
          console.log(JSON.stringify(err))
        } else {
          // Use the public_token to initialize Link
          var PUBLIC_TOKEN = res.public_token
          console.log(`Saving broken public token: ${PUBLIC_TOKEN}`)

          balanceError.publicToken = PUBLIC_TOKEN
          transactionError.publicToken = PUBLIC_TOKEN
          return PUBLIC_TOKEN
        }
      }
    )
  },
}
