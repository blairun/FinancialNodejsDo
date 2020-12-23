const dayjs = require('dayjs')
const year = dayjs().format('YYYY')

module.exports = [
  {
    UserID: 1,
    Year: year,
    Name: 'User 1 Home',
    Start: 500,
    Add: 2000,
    Order: 1,
    Notes: '= Goal note',
  },
  {
    UserID: 1,
    Year: year,
    Name: 'User 1 HSA',
    Start: 1000,
    Add: 2000,
    Order: 2,
    Notes: '= Goal note',
  },
]
