/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'

const userValidate = Joi.object({
  name: Joi.string().required().min(6).max(255).label('Name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  email: Joi.string().email().required().label('Email').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  password: Joi.string().required().min(6).max(255).label('Password').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  mobile: Joi.string().required().label('Mobile').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  address: Joi.string().required().min(6).max(255).label('Email').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  
}).options({
  abortEarly: false
})
export default userValidate
