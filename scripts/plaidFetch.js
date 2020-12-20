const dayjs = require('dayjs')
const { developmentClient, sandboxClient } = require('./plaidClient')
const { plaidPublicToken } = require('../controllers/PlaidsCtrl')
const nodemailer = require('nodemailer')
const transactionError = require('./plaidError')
const balanceError = require('./plaidError')
const saveEnv = require('./saveEnv')

const plaidClient = function () {
  // default to plaid dev environment
  let client = developmentClient
  if (process.env.PLAID_ENV === 'sandbox') {
    client = sandboxClient
  }
  return client
}

async function plaidError(account, err) {
  // Handle plaid update errors by saving account info that will be needed to update credentials
  console.log(`Saving broken account: ${account}`)
  saveEnv({
    [`PLAID_broken_account`]: account,
  })
  console.log('Saved.')
  console.log()

  account = account.replace(/ /g, '_')
  // console.log(account)
  let token = process.env[`PLAID_TOKEN_${account}`]
  if (process.env.PLAID_ENV === 'sandbox') {
    token = process.env[`sandbox_PLAID_TOKEN_${account}`]
  }
  console.log(`Saving broken access token: ${token}`)
  saveEnv({
    [`PLAID_broken_access_token`]: token,
  })
  console.log('Saved.')
  console.log()

  // trade broken access token for public token
  await plaidPublicToken()

  const error = `${account.toUpperCase()} - ${err.error_code}\n${
    err.error_message
  }`
  // console.log(error);
  exports.emailer('Plaid Error', error)
  return error
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
            transactionError.set(error)
            console.log(`transactions error:: ${transactionError.err}`)
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
          let error = await plaidError(account, err)
          balanceError.set(error)
          console.log(`balance error:: ${balanceError.err}`)
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

// realtime values for individual accounts (not used)
exports.fetchItemBalances = async function (itemToken) {
  try {
    // console.log("top1");
    return new Promise((resolve, reject) => {
      // console.log("top2");
      let client = plaidClient()
      client.getBalance(itemToken, (err, result) => {
        // Handle err
        if (err != null) {
          const tokenToAccount = plaidAccountTokens.find(
            ({ token }) => token === itemToken
          )
          var error =
            // account.toUpperCase() +
            tokenToAccount.account.toUpperCase() +
            ' / Balances / ' +
            err.error_code +
            ': ' +
            err.error_message
          console.log(error)
        } else {
          // return accounts
          // console.log(result);
          const accounts = result.accounts
          // console.log(accounts);
          var balanceArray = accounts.map(({ name, account_id, balances }) => ({
            account_id,
            name,
            available_balance: balances.available,
            current_balance: balances.current,
            limit: balances.limit,
            date: dayjs().format('M/D/Y'),
          }))
          // console.log(balanceArray)
          // return balanceArray
          resolve(balanceArray)
        }
      })
    })
  } catch (error) {
    // console.log(error)
  }
}

// async..await is not allowed in global scope, must use a wrapper
exports.emailer = async function (subject, body) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount()

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: `${process.env.GMAIL_USER}@gmail.com`, // generated ethereal user
      pass: process.env.GMAIL_APP_PASS, // generated ethereal password
      // https://stackoverflow.com/questions/26736062/sending-email-fails-when-two-factor-authentication-is-on-for-gmail
    },
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"me 👻" <${process.env.GMAIL_USER}@gmail.com>`, // sender address
    to: `${process.env.GMAIL_USER}+automated_finances@gmail.com`, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
    // html: "<b>Hello world?</b>" // html body
  })

  console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
