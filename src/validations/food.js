import Joi from 'joi';

const foodValidationSchema = Joi.object({
  name: Joi.string().trim(),
  image: Joi.string(),
  price: Joi.number().min(0),
  ticketId: Joi.array().items(Joi.string()),
  isDeleted: Joi.boolean()
}).options({
  abortEarly: false
})
export default foodValidationSchema