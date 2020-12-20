// import formulajs from "formulajs";
var f = require('@formulajs/formulajs')
var m = require('dayjs')

// =29000-vdb(29000,5000,15*12,0,datedif(date(2019,6,1),today(),"m"),1.2)

// 'VDB is not implemented' in formula js
// DDB calculates depreciation per period, so looping through that give VDB
// https://formulajs.info/functions/
// https://www.excel-easy.com/examples/depreciation.html

// + Add these values to account metadata
// --- before pulling balances ---
// + bring them into server
// + use fuction/formula below to calculate asset value for current date
// + write new value back to databse
// + then pull balances, which will write the updated asset value to todays date in balance table

module.exports = function (cost, salvage, life, startDate) {
  // function depreciation(cost, salvage, life, startDate) {
  // const cost = 29000;
  // const salvage = 5000;
  // const life = 12 * 15; // 15 years in months
  // const startDate = m([2019, 6, 1]);
  const lifetime = life * 12
  const startPeriod = 0
  const today = m()
  const startingDate = m(startDate)
  const endPeriod = today.diff(startingDate, 'months')
  // console.log(endPeriod);
  const period = endPeriod - startPeriod

  const periods = Array.from(Array(period + 1).keys()) // plus one since array starts at zero
  // const periods = Array.from(Array(1*15).keys())
  // console.log(periods);

  const factor = 1.5 // Rate of balance decline (the default is 2: the double-declining balance method).

  let depreciation = 0
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i]
    d = f.DDB(cost, salvage, lifetime, p, factor)
    depreciation += d
  }
  const currentValue = cost - depreciation
  // const currentValue = cost - f.DDB(cost,salvage,life,period,factor)
  // const currentValue = cost - f.DDB(cost,salvage,life,0,factor)

  // console.log(currentValue);
  return currentValue
}
