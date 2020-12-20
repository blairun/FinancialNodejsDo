const { userPlaidAccounts } = require('../controllers/PlaidsCtrl')
const { updateBalances } = require('../scripts/updateBalances')

;(async () => {
  process.env.PLAID_ENV = 'development'
  let userId = 1
  let plaidAccounts = await userPlaidAccounts(userId)
  updateBalances(plaidAccounts, userId)
})()
