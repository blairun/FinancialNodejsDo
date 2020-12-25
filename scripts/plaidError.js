require('dotenv').config()

var balanceError = (module.exports = {
  clear: function () {
    balanceError.err = ''
    balanceError.publicToken = ''
  },
})

var transactionError = (module.exports = {
  clear: function () {
    transactionError.err = ''
    transactionError.publicToken = ''
  },
})
