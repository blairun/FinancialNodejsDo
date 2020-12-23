const dayjs = require('dayjs')
const date1 = dayjs().format('YYYY-MM-DD')
const date2 = dayjs().subtract(1, 'months').format('YYYY-MM-DD')
const date3 = dayjs().subtract(2, 'months').format('YYYY-MM-DD')
const retrievalDate = dayjs().format()

module.exports = [
  {
    UserID: 1,
    AccountID: 'AccountID1',
    TransactionID: 1,
    TransactionDate: date1,
    Description: 'Description1',
    Amount: -100,
    Category: 'Shops,Hardware Store',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  {
    UserID: 1,
    AccountID: 'AccountID2',
    TransactionID: 2,
    TransactionDate: date1,
    Description: 'Description2',
    Amount: 200,
    Category: 'Credit',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  {
    UserID: 1,
    AccountID: 'AccountID1',
    TransactionID: 3,
    TransactionDate: date1,
    Description: 'Description3',
    Amount: -100,
    Category: 'Other',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  ///////////////////////////////////////////////
  ///////////////////////////////////////////////
  {
    UserID: 1,
    AccountID: 'AccountID1',
    TransactionID: 4,
    TransactionDate: date2,
    Description: 'Description4',
    Amount: -300,
    Category: 'Shops,Convenience Stores',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  {
    UserID: 1,
    AccountID: 'AccountID2',
    TransactionID: 5,
    TransactionDate: date2,
    Description: 'Description5',
    Amount: 100,
    Category: 'Credit',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  {
    UserID: 1,
    AccountID: 'AccountID1',
    TransactionID: 6,
    TransactionDate: date2,
    Description: 'Description6',
    Amount: -50,
    Category: 'Service,Entertainment',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  ///////////////////////////////////////////////
  ///////////////////////////////////////////////
  {
    UserID: 1,
    AccountID: 'AccountID1',
    TransactionID: 7,
    TransactionDate: date3,
    Description: 'Description7',
    Amount: -55,
    Category: 'Shops,Hardware Store',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  {
    UserID: 1,
    AccountID: 'AccountID2',
    TransactionID: 8,
    TransactionDate: date3,
    Description: 'Description8',
    Amount: 444,
    Category: 'Credit',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
  {
    UserID: 1,
    AccountID: 'AccountID1',
    TransactionID: 9,
    TransactionDate: date3,
    Description: 'Description9',
    Amount: -250,
    Category: 'Service,Automotive,Maintenance and Repair',
    Pending: 0,
    RetrievalDate: retrievalDate,
  },
]
