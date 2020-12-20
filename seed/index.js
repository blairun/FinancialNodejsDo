// package Script: "seed": "node seed"
// runs the index file in the seed folder?
// creates sandbox users for testing / show and tell.

const {
  sequelize,
  User,
  Plaid,
  Goal,
  AccountMeta,
  // Balance,
} = require('../models')

const Promise = require('bluebird')
const users = require('./users.json')
const plaids = require('./plaids.js')
const goals = require('./goals.json')
const accountMetas = require('./accountMetas.json')
// const balances = require('./balances.json')

sequelize.sync({ force: true }).then(async function () {
  // must come first due to foreign key constraints
  await Promise.all(
    users.map((user) => {
      User.create(user)
    })
  )
  await Promise.all(
    plaids.map((plaid) => {
      Plaid.create(plaid)
    })
  )
  await Promise.all(
    goals.map((goal) => {
      Goal.create(goal)
    })
  )
  await Promise.all(
    accountMetas.map((accountMeta) => {
      AccountMeta.create(accountMeta)
    })
  )
  // await Promise.all(
  //   balances.map((balance) => {
  //     Balance.create(balance)
  //   })
  // )
})
