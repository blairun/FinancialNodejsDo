require('dotenv').config()

// Plaid sandbox tokens expire quickly, so these are likely invalid
// For testing, it's easier to just add a new sandbox account using the web interface

module.exports = [
  {
    UserID: 2,
    ItemName: 'usbank',
    PlaidToken: process.env.sandbox_PLAID_TOKEN_usbank,
  },
  {
    UserID: 2,
    ItemName: 'american express',
    PlaidToken: process.env.sandbox_PLAID_TOKEN_american_express,
  },
  {
    UserID: 3,
    ItemName: 'chase',
    PlaidToken: process.env.sandbox_PLAID_TOKEN_chase,
  },
  {
    UserID: 3,
    ItemName: 'citi',
    PlaidToken: process.env.sandbox_PLAID_TOKEN_citi,
  },
  {
    UserID: 3,
    ItemName: 'wells fargo',
    PlaidToken: process.env.sandbox_PLAID_TOKEN_wells_fargo,
    // Hide means that the account transactions will be hidden in Transactions view
    Hide: true,
  },
]
