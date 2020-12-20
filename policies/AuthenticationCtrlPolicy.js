const Joi = require('joi')

module.exports = {
  register(req, res, next) {
    const schema = Joi.object({
      username: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{3,20}$')),
      email: Joi.string().email(),
      password: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{8,32}$')),
      // name: Joi.string().min(6).required(),
    })

    // const validation = schema.validate(req.body);
    // console.log(validation);
    const { error } = schema.validate(req.body)

    if (error) {
      switch (error.details[0].context.key) {
        case 'email':
          res.status(400).send({
            error: 'You must provide a valid email address.',
          })
          break
        case 'password':
          res.status(400).send({
            error: `The password provided failed to match the following rules:
              <br>
              1. It must contain ONLY the following characters: lower case, upper case, numerics.
              <br>
              2. It must be at least 8 characters in length and not greater than 32 characters in length.
            `,
          })
          break
        case 'username':
          res.status(400).send({
            error: `Usernames must be between 3 and 20 alphanumeric characters.`,
          })
          break
        default:
          res.status(400).send({
            error: 'Invalid registration information',
          })
      }
    } else {
      next()
    }
  },
}
