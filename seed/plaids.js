// Plaid sandbox tokens expire quickly, so saving them to the db would be pointless
// For testing, it's easier to just add a new sandbox account using the web interface

module.exports = [
  {
    UserID: 2,
    ItemName: 'usbank',
    PlaidToken: 'abc1',
  },
  {
    UserID: 2,
    ItemName: 'american express',
    PlaidToken: 'abc2',
  },
  {
    UserID: 3,
    ItemName: 'chase',
    PlaidToken: 'abc3',
  },
  {
    UserID: 3,
    ItemName: 'wells fargo',
    PlaidToken: 'abc4',
    // Hide means that the account transactions will be hidden in Transactions view
    Hide: true,
  },
]
