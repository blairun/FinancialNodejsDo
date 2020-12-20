module.exports = (sequelize, DataTypes) => {
  const Plaid = sequelize.define(
    'Plaid',
    {
      UserID: DataTypes.INTEGER,
      ItemName: DataTypes.STRING,
      PlaidToken: {
        type: DataTypes.STRING,
        unique: true,
      },
      Order: DataTypes.INTEGER,
      // Hide means that the account transactions will be hidden in Transactions view
      Hide: DataTypes.BOOLEAN,
      Closed: DataTypes.BOOLEAN,
      Notes: DataTypes.TEXT,
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
    }
  )

  Plaid.associate = function (models) {
    Plaid.belongsTo(models.User, {
      foreignKey: 'UserID',
      targetKey: 'id',
    })
  }

  return Plaid
}
