module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      UserID: DataTypes.INTEGER,
      Account: DataTypes.STRING,
      AccountID: DataTypes.STRING,
      TransactionID: {
        type: DataTypes.STRING,
        primaryKey: true,
        // unique: true,
      },
      // sequelize reformats DATE types, so better to save as string
      TransactionDate: DataTypes.STRING,
      Description: DataTypes.STRING,
      Amount: DataTypes.DOUBLE,
      Pending: DataTypes.BOOLEAN,
      PendingTransactionID: DataTypes.STRING,
      Category: DataTypes.STRING,
      Location: DataTypes.STRING,
      Merchant: DataTypes.STRING,
      PaymentChannel: DataTypes.STRING,
      TransactionType: DataTypes.STRING,
      // sequelize reformats DATE types, so better to save as string
      // Hide is defined in the  Plaid table and means that the
      // account transactions will be hidden in Transactions view
      Hide: DataTypes.BOOLEAN,
      RetrievalDate: DataTypes.STRING,
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
    }
  )

  Transaction.associate = function (models) {
    Transaction.belongsTo(models.AccountMeta, {
      foreignKey: 'AccountID',
      targetKey: 'AccountID',
    })
    Transaction.belongsTo(models.User, {
      foreignKey: 'UserID',
      targetKey: 'id',
    })
  }

  return Transaction
}
