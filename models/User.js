const bcrypt = require('bcrypt')
const saltRounds = 8

function hashPassword(user, options) {
  // console.log(!user.changed("password"))
  // if (!user.changed("password")) {
  //   return;
  // }
  // console.log(user.password);

  const hash = bcrypt.hashSync(user.password, saltRounds)
  // Store hash in your password DB.
  // console.log(hash);
  user.setDataValue('password', hash)
  return
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: DataTypes.STRING,
      plaidEnv: {
        type: DataTypes.STRING,
        defaultValue: 'sandbox',
      },
      closed: DataTypes.BOOLEAN,
    },
    {
      hooks: {
        // beforeCreate: hashPassword,
        // beforeUpdate: hashPassword,
        beforeSave: hashPassword,
      },
    }
  )

  User.prototype.comparePassword = function (password) {
    // console.log("hi");
    // console.log(password);
    // console.log(this.password);
    // console.log(bcrypt.compareSync(password, this.password));
    // bcrypt.compare(password, this.password, function (err, res) {
    //   console.log(res);
    //   return res;
    // });
    return bcrypt.compareSync(password, this.password)
  }

  User.prototype.hashPass = function (user, newPassword) {
    // console.log("hash");
    let hash = bcrypt.hashSync(newPassword, saltRounds)
    // console.log(hash);
    // user.setDataValue("password", hash);
    return hash
  }

  User.associate = function (models) {}

  return User
}
