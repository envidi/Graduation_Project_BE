import Joi from 'joi';

const roleUserValidate = Joi.object({
  roleName: Joi.string().required().label('Role Name').messages({
    'string.empty': '{{#label}} is required'
  }),
  status: Joi.string().required().label('Status').messages({
    'string.empty': '{{#label}} is required'
  }),
  userIds: Joi.array().items(Joi.string().required()).min(1).label('User IDs').messages({
    'array.min': '{{#label}} must have at least 1 user',
    'any.required': '{{#label}} is required'
  })
  // Các trường khác trong mô hình RoleUser
  // ...
}).options({
  abortEarly: false
});

export default roleUserValidate;