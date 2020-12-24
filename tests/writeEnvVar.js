const saveEnv = require('../scripts/saveEnv')

function writeEnvVar(account) {
  saveEnv({
    [`PLAID_broken_account`]: account,
  })
  console.log('Saved.')
}

writeEnvVar('test')
