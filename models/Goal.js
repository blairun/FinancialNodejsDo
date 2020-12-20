module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define(
    'Goal',
    {
      UserID: DataTypes.INTEGER,
      Year: DataTypes.INTEGER,
      Name: DataTypes.STRING,
      Start: DataTypes.DOUBLE,
      Add: DataTypes.DOUBLE,
      Order: DataTypes.INTEGER,
      Notes: DataTypes.TEXT,
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
    }
  )

  Goal.associate = function (models) {
    Goal.belongsTo(models.User, {
      foreignKey: 'UserID',
      targetKey: 'id',
    })
  }

  return Goal
}
