require('dotenv').config()

var balanceError = (module.exports = {
  err: '',
  set: function (err) {
    balanceError.err = err
    balanceError.publicToken = process.env.PLAID_broken_public_token
  },
  clear: function () {
    balanceError.err = ''
    balanceError.publicToken = ''
  },
})

var transactionError = (module.exports = {
  err: '',
  set: function (err) {
    transactionError.err = err
    transactionError.publicToken = process.env.PLAID_broken_public_token
  },
  clear: function () {
    transactionError.err = ''
    transactionError.publicToken = ''
  },
})
