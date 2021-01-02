module.exports = (sequelize, DataTypes) => {
  const Balance = sequelize.define(
    'Balance',
    {
      UserID: DataTypes.INTEGER,
      AccountID: DataTypes.STRING,
      Name: DataTypes.STRING,
      OfficialName: DataTypes.STRING,
      Available: DataTypes.DOUBLE,
      Current: DataTypes.DOUBLE,
      Limit: DataTypes.DOUBLE,
      Type: DataTypes.STRING,
      Subtype: DataTypes.STRING,
      // sequelize reformats DATE types, so better to save as string
      RetrievalDate: DataTypes.STRING,
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
    }
  )

  Balance.associate = function (models) {
    Balance.belongsTo(models.AccountMeta, {
      foreignKey: 'AccountID',
      targetKey: 'AccountID',
      onDelete: 'CASCADE',
      hooks: true,
    })
    Balance.belongsTo(models.User, {
      foreignKey: 'UserID',
      targetKey: 'id',
    })
  }

  return Balance
}
