import Joi from 'joi'

const productSchema = Joi.object({
  name: Joi.string().required().min(6).max(255),
  desc: Joi.string(),
  author: Joi.string().required().min(1).max(255),
  trailer: Joi.string().required().min(1),
  // category: Joi.number().required().min(0)
  category: Joi.array().items(Joi.string()).min(1).required()
}).options({
  abortEarly: false
})
export default productSchema