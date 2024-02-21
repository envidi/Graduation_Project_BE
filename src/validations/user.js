/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'

const userValidate = Joi.object({
  name: Joi.string().required().min(6).max(255).label('name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  email: Joi.string().email().required().label('email').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  password: Joi.string().required().min(6).max(255).label('password').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  mobile: Joi.string().required().label('mobile').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  address: Joi.string().required().min(6).max(255).label('address').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  roleIds: Joi.string().min(6).max(255)
}).options({
  abortEarly: false
})
export default userValidate
