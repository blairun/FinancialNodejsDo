const dayjs = require('dayjs')
const { developmentClient, sandboxClient } = require('./plaidClient')
const { plaidPublicToken } = require('../controllers/PlaidsCtrl')
const transactionError = require('./plaidError')
const balanceError = require('./plaidError')

const plaidClient = function () {
  // default to plaid dev environment
  let client = developmentClient
  if (process.env.PLAID_ENV === 'sandbox') {
    client = sandboxClient
  }
  return client
}

async function plaidError(account, token, err) {
  // Handle plaid update errors. Get public token to refresh credentials
  // and save plaid error message
  // console.log(`broken account: ${account}`)
  // console.log(`broken access token: ${token}`)

  // trade broken access token for public token (publicToken saved in plaidPublicToken function)
  await plaidPublicToken(token)

  try {
    const error = `${account.toUpperCase()} - ${err.error_code}\n${
      err.error_message
    }`
    // console.log(error);
    return error
  } catch (errr) {
    return errr
  }
}

exports.fetchTransactions = async function (plaidAccounts, userId, months) {
  // console.log(`months: ${months}`)
  // grab previous month(s) plus current month
  const startDate = dayjs()
    .subtract(months, 'month')
    .startOf('month')
    .format('YYYY-MM-DD')
  const endDate = dayjs().format('YYYY-MM-DD')

  const transactionFetchOptions = [
    startDate,
    endDate,
    {
      count: 250,
      offset: 0,
    },
  ]

  const rawTransactions = await Promise.all(
    // plaidAccountTokens.map(({ account, token }) => {
    plaidAccounts.map(({ account, token, hide }) => {
      let client = plaidClient()
      client.getTransactions(
        token,
        ...transactionFetchOptions,
        async (err, res) => {
          // console.log(account)
          if (err != null) {
            let error = await plaidError(account, err)
            transactionError.err = error
            console.log(`transactions error: ${transactionError.err}`)
            return
          }
          // console.log(res);
        }
      )
      return client
        .getTransactions(token, ...transactionFetchOptions)
        .then(({ transactions }) => ({
          account,
          hide,
          transactions,
        }))
    })
  )
  // console.log(rawTransactions)

  // concat all transactions
  return rawTransactions.reduce((all, { account, hide, transactions }) => {
    return all.concat(
      transactions.map(
        ({
          account_id,
          transaction_id,
          date,
          name,
          amount,
          pending,
          pending_transaction_id,
          category,
          location,
          merchant_name,
          payment_channel,
          transaction_type,
        }) => ({
          UserID: userId,
          Account: account,
          AccountID: account_id,
          TransactionID: transaction_id,
          TransactionDate: date,
          Description: name,
          Amount: -amount,
          Pending: pending,
          PendingTransactionID: pending_transaction_id,
          Category: String(category), //https://github.com/yyx990803/build-your-own-mint/pull/16
          Location: `${location.address}, ${location.city}, ${location.region} ${location.postal_code}, ${location.country}`,
          Merchant: merchant_name,
          PaymentChannel: payment_channel, // in store or online
          TransactionType: transaction_type, // place or online
          Hide: hide,
          RetrievalDate: dayjs().format(),
        })
      )
    )
  }, [])
}

// /accounts/get (Retrieve high-level information about all accounts associated with an Item.)
// faster than using
// /accounts/balance/get (Check balances in real time to prevent non-sufficient funds fees.)
exports.getAccounts = async function (plaidAccounts, userId) {
  // pull plaidAccountTokens (plaidAccounts) from db rather than .env
  // console.log(process.env.PLAID_ENV);
  const rawBalances = await Promise.all(
    // plaidAccountTokens.map(({ account, token }) => {
    plaidAccounts.map(({ account, token, id }) => {
      // console.log(account);
      let client = plaidClient()
      // console.log(client);
      // client.getBalance(token, async (err, res) => {
      client.getAccounts(token, async (err, res) => {
        if (err != null) {
          let error = await plaidError(account, token, err)
          balanceError.err = error
          console.log(`balance error: ${balanceError.err}`)
          // return
        }
        // console.log(account);
        // console.log(id);
        // console.log(res);
        // res.plaidItem = { account: account, id: id };
        // console.log(res);
      })

      return client.getAccounts(token)
    })
  )

  // add in plaid item info before reformatting
  for (let i = 0; i < rawBalances.length; i++) {
    rawBalances[i].plaidItem = {
      account: plaidAccounts[i].account,
      id: plaidAccounts[i].id,
    }
    // console.log(rawBalances[i]);
  }

  // console.log(rawBalances)

  return rawBalances.reduce((all, { accounts, plaidItem }) => {
    // console.log(plaidItem)
    return all.concat(
      accounts.map(
        ({ name, official_name, account_id, balances, type, subtype }) => ({
          UserID: userId,
          AccountID: account_id,
          Name: name,
          OfficialName: official_name,
          Available: balances.available,
          Current: balances.current,
          Limit: balances.limit,
          Type: type,
          Subtype: subtype,
          RetrievalDate: dayjs().format(),
          plaid_id: plaidItem.id,
          plaid_name: plaidItem.account,
        })
      )
    )
  }, [])
}
