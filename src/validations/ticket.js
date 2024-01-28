import Joi from 'joi'

const ticketValidateSchema = Joi.object({
  prices: Joi.string().required(),
  seatId: Joi.array().items(Joi.string()).required().min(1),
  foodId: Joi.array().items(Joi.string()),
  showtimeId: Joi.string().required().trim(),
  quantity: Joi.number().min(1).max(2),
  totalPrice: Joi.number().min(1)
}).options({
  abortEarly: false
})

export default ticketValidateSchema