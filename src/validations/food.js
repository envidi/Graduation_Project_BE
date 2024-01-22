import Joi from 'joi';

const foodValidationSchema = Joi.object({
  name: Joi.string().trim().required(),
  image: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(0).required(),
  ticketId: Joi.array().items(Joi.string()),
  isDeleted: Joi.boolean()
}).options({
  abortEarly: false
})
export default foodValidationSchema