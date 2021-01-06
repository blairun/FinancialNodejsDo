const { User } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function jwtSignUser(user) {
  const ONE_WEEK = 60 * 60 * 24 * 7
  const TWO_MONTHS = 60 * 60 * 24 * 7 * 4 * 2
  return jwt.sign(user, config.authentication.jwtSecret, {
    // expiresIn: ONE_WEEK,
    expiresIn: TWO_MONTHS,
  })
}

module.exports = {
  async register(req, res) {
    try {
      const user = await User.create(req.body)
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson),
      })
    } catch (err) {
      res.status(400).send({
        error:
          'This email account is already in use. Please try a different one.',
      })
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body
      const user = await User.findOne({
        where: {
          email: email,
        },
      })

      if (!user) {
        return res.status(403).send({
          // error: 'email',
          error: 'The login information was incorrect',
        })
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(403).send({
          // error: 'password',
          error: 'The login information was incorrect',
        })
      }

      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson),
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to log in',
      })
    }
  },

  async update(req, res) {
    try {
      const {
        username,
        email,
        oldPassword,
        newPassword1,
        newPassword2,
        oldEmail,
      } = req.body

      let user = await User.findOne({
        where: {
          email: oldEmail,
        },
      })
      // console.log(user)

      if (newPassword1 !== null && newPassword1 !== '') {
        const isPasswordValid = await user.comparePassword(oldPassword)
        if (!isPasswordValid) {
          return res.status(403).send({
            // error: 'password',
            error: 'The old password is incorrect.',
          })
        } else {
          // console.log('password updating')
          const password = await user.hashPass(user, newPassword1)
          await User.update(
            { password: password },
            { where: { email: oldEmail } }
          )
        }
        // console.log('password updated')
      }

      try {
        await User.update(
          // Values to update
          {
            username: username,
            email: email,
          },
          // Value to search
          { where: { email: oldEmail } }
        )
      } catch (err) {
        res.status(400).send({
          error:
            'This email account is already in use. Please try a different one.',
        })
      }

      user = await User.findOne({
        where: {
          email: email,
        },
      })
      // console.log(user)

      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson),
      })
    } catch (error) {
      res.status(500).send({
        error: 'An error occurred trying to update this profile.',
      })
    }
  },
}
