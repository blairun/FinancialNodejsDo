require('dotenv').config()
var CronJob = require('cron').CronJob
const { userPlaidAccounts } = require('./controllers/PlaidsCtrl')
const { updateBalances } = require('./scripts/updateBalances')
const { updateTransactions } = require('./scripts/updateTransactions')
const { archive } = require('./drive/archiver')
const { backup } = require('./drive/backupDb')

// adds twice daily balance/transaction retrieval
;(async () => {
  // console.log('Before job instantiation')

  process.env.PLAID_ENV = 'development'
  let userId = 1
  let plaidAccounts = await userPlaidAccounts(userId)
  // console.log(plaidAccounts)

  const jobTransactions = new CronJob('30 11,23 * * *', function () {
    updateTransactions(plaidAccounts, userId)
  })

  const jobBalances = new CronJob('35 11,23 * * *', function () {
    updateBalances(plaidAccounts, userId)
  })

  const jobArchive = new CronJob('40 11,23 * * *', function () {
    archive()
  })

  const jobBackup = new CronJob('45 11,23 * * *', function () {
    backup()
  })

  // // var job = new CronJob('* * * * * *', function() {
  // // 	console.log('You will see this message every second');
  // // }, null, true, 'America/Los_Angeles');

  // // var job = new CronJob('* * * * *', function() {
  // // 	updateTransactions()
  // // 	console.log('You will see this message every minute');
  // // }, null, true, 'America/Los_Angeles');

  // console.log('After job instantiation')

  // job.start()
  jobTransactions.start()
  jobBalances.start()
  jobArchive.start()
  jobBackup.start()

  // archive and backup one at a time when testing to avoid
  // corruption when saving file to Drive
  // archive()
  // backup()
  // updateTransactions(plaidAccounts, userId)
  // updateBalances(plaidAccounts, userId)
})()
