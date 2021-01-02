function updateAccount(accountMeta, options) {
  // console.log(accountMeta);
  // console.log(accountMeta.Institution);
  // console.log(options);
  if (!accountMeta.AccountID) {
    const rand = makeId(5)
    // console.log(rand);
    accountMeta.setDataValue(
      'AccountID',
      `${accountMeta.Institution}-${accountMeta.FriendlyName}-${rand}`
    )
  }
  return
}

function makeId(length) {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

module.exports = (sequelize, DataTypes) => {
  const AccountMeta = sequelize.define(
    'AccountMeta',
    {
      UserID: DataTypes.INTEGER,
      // Transfered plaid account tokens from .env to db
      PlaidID: DataTypes.INTEGER,
      AccountID: {
        type: DataTypes.STRING,
        unique: true,
      },
      Institution: DataTypes.STRING,
      FriendlyName: DataTypes.STRING,
      GoalID: DataTypes.INTEGER,
      Link: DataTypes.STRING,
      Notes: DataTypes.STRING,
      BackupAmount: DataTypes.DOUBLE,
      BackupType: DataTypes.STRING,
      Order: DataTypes.INTEGER,
      Cost: DataTypes.DOUBLE,
      Salvage: DataTypes.DOUBLE,
      Life: DataTypes.DOUBLE,
      // sequelize reformats DATE types, so better to save as string
      StartDate: DataTypes.STRING,
      LoanID: DataTypes.STRING,
      Closed: DataTypes.BOOLEAN,
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
      hooks: {
        beforeSave: updateAccount,
      },
    }
  )

  AccountMeta.associate = function (models) {
    AccountMeta.belongsTo(models.Goal, {
      foreignKey: 'GoalID',
      targetKey: 'id',
    })
    AccountMeta.belongsTo(models.AccountMeta, {
      foreignKey: 'LoanID',
      targetKey: 'AccountID',
    })
    AccountMeta.belongsTo(models.User, {
      foreignKey: 'UserID',
      targetKey: 'id',
    })
    AccountMeta.belongsTo(models.Plaid, {
      foreignKey: 'PlaidID',
      targetKey: 'id',
      onDelete: 'CASCADE',
      hooks: true,
    })
  }

  return AccountMeta
}
