const { sequelize } = require('../models')
const { QueryTypes } = require('sequelize')

module.exports = async function (res, sql, name, params = '') {
  // console.log(params);
  // console.log(sql);
  try {
    const data = await sequelize.query(sql, {
      replacements: [params],
      type: QueryTypes.SELECT,
    })
    res.send({
      message: 'success',
      data: data,
    })
  } catch (err) {
    // console.log(err);
    res.status(500).send({
      error: `an error has occurred trying to fetch ${name}`,
    })
  }
}
