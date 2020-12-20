const { userPlaidAccounts } = require('../controllers/PlaidsCtrl')
const { updateTransactions } = require('../scripts/updateTransactions')

;(async () => {
  process.env.PLAID_ENV = 'development'
  let userId = 1
  let plaidAccounts = await userPlaidAccounts(userId)
  updateTransactions(plaidAccounts, userId, 1)
})()
