const { Sequelize, QueryTypes } = require('sequelize')

const s = new Sequelize({
  dialect: 'sqlite',
  storage: 'financial_vue.sqlite',
})

;(async () => {
  try {
    await s.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }

  // let t = 10000

  // const addBalance = await s.query(
  //     `INSERT INTO Balances (AccountID, Name)
  //     VALUES (${t}, '456')`,
  //     { type: QueryTypes.INSERT });
  // console.log(addBalance);

  // let sql = "SELECT * FROM `Balances`"
  let sql = 'SELECT * FROM `Transactions`'

  const balances = await s.query(sql, { type: QueryTypes.SELECT })
  console.log(balances)
})()

// (async () => {
//   const balances = await fetchAllBalances();
//   const formattedValues = transformBalancesToUpdates(balances)
//   try {
//     await s.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
//   let t = 10000

//   const addBalances = await s.query(
//     `INSERT INTO Balances (AccountID, Name, Available, Current, [Limit], Date)
//     VALUES ${formattedValues}`,
//     { type: QueryTypes.INSERT });
//   console.log(addBalances);

//   const b = await s.query("SELECT * FROM `Balances`", { type: QueryTypes.SELECT });
//   console.log(b);

//   // s.close ?
// })()
