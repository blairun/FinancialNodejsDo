require('dotenv').config()
const { getAccounts } = require('./plaidFetch')
const depreciation = require('./depreciation')
const balanceError = require('./plaidError')
const { sequelize } = require('../models')
const { QueryTypes } = require('sequelize')
const { AccountMeta, Balance } = require('../models')
const c = require('../config/config')

// https://stackoverflow.com/questions/35387264/node-js-request-module-getting-etimedout-and-esockettimedout
process.env.UV_THREADPOOL_SIZE = 128

const updateBalances = async function (plaidAccounts, userId) {
  try {
    const balances = await getAccounts(plaidAccounts, userId)
    // console.log('balances')
    // console.log(balances)

    await checkMeta(balances, userId)

    await Balance.bulkCreate(balances)

    const balancesDate = balances[0].RetrievalDate
    // const balancesDate = '2020-08-09T15:03:57-07:00'
    await insertOrphans(balancesDate, userId)

    // adjust asset values after! orphan rows have been inserted
    await assetDepreciation()

    balanceError.clear()
    // console.log(balanceError.err)
    // console.log('balances updated')
    return balancesDate
  } catch (error) {
    // console.log(error)
    balanceError.err = ''
    console.log(error.message)
  }
}

// updateBalances();

module.exports.updateBalances = updateBalances

async function assetDepreciation() {
  let sql1 = c.SQL().assetDepreciation1()
  res = await sequelize.query(sql1, {
    type: QueryTypes.SELECT,
  })

  // console.log(res);
  for (let i = 0; i < res.length; i++) {
    const e = res[i]
    // console.log(e);
    let newValue = depreciation(e.Cost, e.Salvage, e.Life, e.StartDate)
    newValue = newValue.toFixed(0)
    // console.log(newValue);
    let sql2 = c.SQL().assetDepreciation1(newValue, e.id)

    result = await sequelize.query(sql2, {
      type: QueryTypes.UPDATE,
    })
  }

  return
}

// Note that this will show a (non-breaking) sequelize error if there are no orphans to insert
async function insertOrphans(balancesDate, userId) {
  // Every time you pull in balances, also pull in account metadata for missing accounts.
  // If you can connect those accounts in the future, just go into the db.Balances table
  // and update all the corresponding account IDs
  // Could even work if you changed mortgages or cars in the future.

  // select metadata with no matching entry in balance table, only for this batch of balance data
  // if an account is reconnected, then you could go into balance and metadata table and rekey all account IDs
  // closed/inactive/expired accounts handled in metadata table:
  let sql = c.SQL().insertOrphans(balancesDate, userId)
  // e.g. once mortgage ends, mark Closed as true (1) in metadata,
  // which prevents it being added to Balances table in the future

  // first pull in account metadata for accounts that don't have a match
  result = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
  })
  // console.log(result)

  // second format so that data can be used in the sql insertBalances function
  const o = [] // orphans
  for (let i = 0; i < result.length; i++) {
    const r = result[i]
    // console.log(r)
    // let o = orphans[i];
    o[i] = {}
    o[i]['UserID'] = r.UserID
    o[i]['AccountID'] = r.AccountID
    o[i]['Name'] = r.FriendlyName
    o[i]['OfficialName'] = r.Institution
    o[i]['Available'] = null
    o[i]['Current'] = r.BackupAmount
    o[i]['Limit'] = null
    o[i]['Type'] = r.BackupType
    o[i]['Subtype'] = r.BackupType
    o[i]['RetrievalDate'] = balancesDate // must be same as balances retrieval date
  }
  // console.log(o)
  await Balance.bulkCreate(o)

  // console.log(`Orphans Inserted: ${result.changes}`);
  return
}

// update metadata table if account id doesn't yet exist
const checkMeta = async function (balances, userId) {
  for (let i = 0; i < balances.length; i++) {
    const account = balances[i]
    // console.log(account);
    const a = await AccountMeta.findOne({
      where: {
        AccountID: account.AccountID,
      },
    })
    // console.log(a);
    if (!a) {
      await AccountMeta.create({
        UserID: userId,
        PlaidID: balances[i].plaid_id,
        AccountID: balances[i].AccountID,
        Institution: balances[i].plaid_name,
        FriendlyName: balances[i].Name,
      })
    }
  }
}
