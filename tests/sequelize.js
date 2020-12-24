const { Sequelize, QueryTypes } = require('sequelize')
const config = require('../config/config')

const s = new Sequelize(config.db)

;(async () => {
  try {
    await s.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }

  const sql = 'SELECT * FROM public."Balances"'
  const balances = await s.query(sql, { type: QueryTypes.SELECT })
  console.log(balances)
})()
