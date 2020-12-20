const AuthenticationController = require('./controllers/AuthenticationCtrl')
const AuthenticationControllerPolicy = require('./policies/AuthenticationCtrlPolicy')
const BalancesCtrl = require('./controllers/BalancesCtrl')
const TransactionsCtrl = require('./controllers/TransactionsCtrl')

const isAuthenticated = require('./policies/isAuthenticated')
const PlaidsCtrl = require('./controllers/PlaidsCtrl')

module.exports = (app) => {
  app.post(
    '/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register
  )
  app.post('/login', AuthenticationController.login)
  app.post('/update', AuthenticationController.update)

  // current balance data
  app.get('/balances_current', isAuthenticated, BalancesCtrl.current)
  // endpoint accepting date value and getting associated balances
  app.get('/balances_date/:date', isAuthenticated, BalancesCtrl.date)
  app.get('/balances_dates', isAuthenticated, BalancesCtrl.dates)
  app.get('/balances_all', isAuthenticated, BalancesCtrl.all)
  app.get('/balances_goals', isAuthenticated, BalancesCtrl.goals)
  app.get('/balances_update', isAuthenticated, BalancesCtrl.update)
  // app.get("/balances_update/:id", isAuthenticated, BalancesCtrl.update);
  app.get('/balances_error', isAuthenticated, BalancesCtrl.error)
  app.get('/market_data', isAuthenticated, BalancesCtrl.marketData)
  // app.get("/balances", isAuthenticated, BalancesCtrl.index);

  // current transaction data
  app.get('/transactions_current', isAuthenticated, TransactionsCtrl.current)
  app.post('/transactions_update', isAuthenticated, TransactionsCtrl.update)
  app.get('/transactions_error', isAuthenticated, TransactionsCtrl.error)

  app.post('/plaid_add', isAuthenticated, PlaidsCtrl.add)
  app.post('/plaid_update', isAuthenticated, PlaidsCtrl.update)
  app.post('/plaid_remove', isAuthenticated, PlaidsCtrl.remove)
  app.get('/account_metas', isAuthenticated, PlaidsCtrl.metas)
  app.post('/account_metas_update', isAuthenticated, PlaidsCtrl.metas_update)

  // Root path
  app.get('/', (req, res, next) => {
    // res.json({ message: 'Ok' })
    var HTML = '<h1>Server running</h1>'
    // HTML += '<a href="https://192.168.1.150:9999/#/"><h1>Go to Client</h1></a>'
    HTML +=
      '<a href="https://financial-do-x4bpn.ondigitalocean.app/"><h1>Go to Client</h1></a>'
    res.end(HTML)
  })
}
