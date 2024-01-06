import Joi from 'joi';

const foodSchema = Joi.object({
  name: Joi.string().trim().required(),
  image: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(0).required(),
  ticketId: Joi.array().items(Joi.string())
}).options({
  abortEarly: false
})
export default foodSchema