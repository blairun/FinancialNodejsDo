// https://github.com/plaid/quickstart/blob/master/node/index.js

const dotenv = require('dotenv')
dotenv.config()

// const account = process.argv[2]
const account = 'new_account_name'
if (!account) {
  throw new Error('An account name must be provided.')
}

const fs = require('fs')
const util = require('util')
const path = require('path')
const dayjs = require('dayjs')
const express = require('express')
const bodyParser = require('body-parser')
const { developmentClient, sandboxClient } = require('./plaidClient')
const saveEnv = require('./saveEnv')
var exec = require('child_process').exec

let plaidEnv = process.env.PLAID_ENV
console.log(plaidEnv)

// default to dev environment
let APP_PORT = 8082
let client = developmentClient

if (plaidEnv === 'sandbox') {
  client = sandboxClient
  APP_PORT = 8084
}

const app = express()
app.use(express.static(path.resolve(__dirname)))
app.set('view engine', 'ejs')
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)
app.use(bodyParser.json())

app.get('/', (req, res, next) => {
  res.render(path.resolve(__dirname, 'plaid.ejs'), {
    PLAID_ACCOUNT: account,
    PLAID_PUBLIC_KEY: process.env.PLAID_PUBLIC_KEY,
    PLAID_public_token: process.env.PLAID_public_token,
    PLAID_broken_account: process.env.PLAID_broken_account,
    plaidEnv: plaidEnv,
  })
})

let PUBLIC_TOKEN = null
let ITEM_ID = null

function saveAccessToken(token) {
  console.log()
  console.log(`Saving access token for account "${account}": ${token}`)
  saveEnv({
    [`PLAID_TOKEN_${account}`]: token,
  })
  console.log('Saved.')
  console.log()
}

// function savePublicToken(token) {
//   console.log()
//   console.log(`Saving public token: ${token}`)
//   saveEnv({
//     [`PLAID_public_token`]: token
//   })
//   console.log('Saved.')
//   console.log()
// }

app.get('/close_server', function (request, response, next) {
  console.log('closing server')
  var child = exec(`forever stop scripts/plaidServer.js`, function (
    err,
    stdout,
    stderr
  ) {
    if (err) throw err
    else console.log(stdout)
  })
})

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/get_access_token', function (request, response, next) {
  PUBLIC_TOKEN = request.body.public_token
  client.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    ACCESS_TOKEN = tokenResponse.access_token
    saveAccessToken(ACCESS_TOKEN)
    ITEM_ID = tokenResponse.item_id
    prettyPrintResponse(tokenResponse)
    response.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null,
    })
  })
})

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/transactions', function (request, response, next) {
  // Pull transactions for the Item for the last 30 days
  var startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD')
  var endDate = dayjs().format('YYYY-MM-DD')
  client.getTransactions(
    ACCESS_TOKEN,
    startDate,
    endDate,
    {
      count: 250,
      offset: 0,
    },
    function (error, transactionsResponse) {
      if (error != null) {
        prettyPrintResponse(error)
        return response.json({
          error: error,
        })
      } else {
        prettyPrintResponse(transactionsResponse)
        response.json({ error: null, transactions: transactionsResponse })
      }
    }
  )
})

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/identity', function (request, response, next) {
  client.getIdentity(ACCESS_TOKEN, function (error, identityResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(identityResponse)
    response.json({ error: null, identity: identityResponse })
  })
})

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/balance', function (request, response, next) {
  client.getBalance(ACCESS_TOKEN, function (error, balanceResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(balanceResponse)
    response.json({ error: null, balance: balanceResponse })
  })
})

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get('/accounts', function (request, response, next) {
  client.getAccounts(ACCESS_TOKEN, function (error, accountsResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(accountsResponse)
    response.json({ error: null, accounts: accountsResponse })
  })
})

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/auth', function (request, response, next) {
  client.getAuth(ACCESS_TOKEN, function (error, authResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(authResponse)
    response.json({ error: null, auth: authResponse })
  })
})

// reset login to test Update Mode in sandbox environment
app.get('/reset_login', function (request, response, next) {
  console.log('reset_login')
  client.resetLogin(process.env.sandbox_PLAID_TOKEN_citi, function (
    err,
    reset_login_response
  ) {
    // Handle err
    if (err != null) {
      console.log(JSON.stringify(err))
      // reset_login_response.json({
      //   error: JSON.stringify(err),
      // })
    } else {
      console.log(reset_login_response)
    }
  })
})

// Create a one-time use public_token for the Item.
// This public_token can be used to initialize Link
// in update mode for the user
app.get('/create_public_token', function (request, response, next) {
  // console.log("create_public_token");
  // replace the with the access token of the item you want to renew
  client.createPublicToken(process.env.PLAID_broken_access_token, function (
    err,
    res
  ) {
    if (err != null) {
      console.log(JSON.stringify(err))
      response.json({ error: JSON.stringify(err) })
    } else {
      // Use the public_token to initialize Link
      var PUBLIC_TOKEN = res.public_token
      response.json({ public_token: PUBLIC_TOKEN })
      // console.log(PUBLIC_TOKEN)
      // savePublicToken(PUBLIC_TOKEN)
      return PUBLIC_TOKEN
    }
  })
})

//remove item
app.get('/remove_item', function (request, response, next) {
  console.log('remove_item')
  // replace the with the access token of the item you want to remove
  client.removeItem(process.env.PLAID_TOKEN_, (err, result) => {
    if (err != null) {
      // Handle err
      console.log(JSON.stringify(err))
      response.json({
        error: JSON.stringify(err),
      })
    } else {
      // The Item has been removed and the
      // access token is now invalid
      console.log(result)
      console.log(
        'The Item has been removed and the access token is now invalid. Delete the key from .env.'
      )
    }
  })
})

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
app.get('/assets', function (request, response, next) {
  // You can specify up to two years of transaction history for an Asset
  // Report.
  var daysRequested = 10

  // The `options` object allows you to specify a webhook for Asset Report
  // generation, as well as information that you want included in the Asset
  // Report. All fields are optional.
  var options = {
    client_report_id: 'Custom Report ID #123',
    // webhook: 'https://your-domain.tld/plaid-webhook',
    user: {
      client_user_id: 'Custom User ID #456',
      first_name: 'Alice',
      middle_name: 'Bobcat',
      last_name: 'Cranberry',
      ssn: '123-45-6789',
      phone_number: '555-123-4567',
      email: 'alice@example.com',
    },
  }
  client.createAssetReport([ACCESS_TOKEN], daysRequested, options, function (
    error,
    assetReportCreateResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    prettyPrintResponse(assetReportCreateResponse)

    var assetReportToken = assetReportCreateResponse.asset_report_token
    respondWithAssetReport(20, assetReportToken, client, response)
  })
})

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/item', function (request, response, next) {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  client.getItem(ACCESS_TOKEN, function (error, itemResponse) {
    if (error != null) {
      prettyPrintResponse(error)
      return response.json({
        error: error,
      })
    }
    // Also pull information about the institution
    client.getInstitutionById(itemResponse.item.institution_id, function (
      err,
      instRes
    ) {
      if (err != null) {
        var msg = 'Unable to pull institution information from the Plaid API.'
        console.log(msg + '\n' + JSON.stringify(error))
        return response.json({
          error: msg,
        })
      } else {
        prettyPrintResponse(itemResponse)
        response.json({
          item: itemResponse.item,
          institution: instRes.institution,
        })
      }
    })
  })
})

var server = app.listen(APP_PORT, function () {
  console.log(`Server started at http://localhost:${APP_PORT}`)
  console.log(`Server started at http://192.168.1.150:${APP_PORT}`)
})

var prettyPrintResponse = (response) => {
  console.log(util.inspect(response, { colors: true, depth: 4 }))
}

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.
var respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining == 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    })
  }

  client.getAssetReport(assetReportToken, function (
    error,
    assetReportGetResponse
  ) {
    if (error != null) {
      prettyPrintResponse(error)
      if (error.error_code == 'PRODUCT_NOT_READY') {
        setTimeout(
          () =>
            respondWithAssetReport(
              --numRetriesRemaining,
              assetReportToken,
              client,
              response
            ),
          1000
        )
        return
      }

      return response.json({
        error: error,
      })
    }

    client.getAssetReportPdf(assetReportToken, function (
      error,
      assetReportGetPdfResponse
    ) {
      if (error != null) {
        return response.json({
          error: error,
        })
      }

      response.json({
        error: null,
        json: assetReportGetResponse.report,
        pdf: assetReportGetPdfResponse.buffer.toString('base64'),
      })
    })
  })
}

app.post('/set_access_token', function (request, response, next) {
  ACCESS_TOKEN = request.body.access_token
  client.getItem(ACCESS_TOKEN, function (error, itemResponse) {
    response.json({
      item_id: itemResponse.item.item_id,
      error: false,
    })
  })
})
