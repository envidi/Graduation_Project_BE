/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'

const productSchema = Joi.object({
  name: Joi.string().required().min(6).max(255).label('Name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  desc: Joi.string(),
  author: Joi.string().required().min(1).max(255),
  image: Joi.string().required().min(1).max(255),
  duration: Joi.number().required().min(30).max(300),
  country: Joi.string().required().min(1).max(100),
  trailer: Joi.string().required().min(1),
  age_limit: Joi.number().required().min(1).max(100),
  categoryId: Joi.array().items(Joi.string()).min(1).required(),
  fromDate: Joi.date().required().greater('now'),
  toDate: Joi.date().required().greater(Joi.ref('fromDate')),
  status: Joi.string().required().min(1).max(255),
  rate: Joi.number().required().min(1).max(5),
  // Trong array của show_schedule thêm một object có trường id và name
  show_scheduleId: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required()
      })
    )
    .min(1)
    .required()
}).options({
  abortEarly: false
})
export default productSchema
