import Joi from 'joi'

const ticketValidateSchema = Joi.object({
  prices: Joi.string().required(),
  seatId: Joi.string().required().trim(),
  foodId: Joi.array().items(Joi.string()),
  showtimeId: Joi.string().required().trim(),
  quantity: Joi.number().required().min(1).max(2),
  totalPrice: Joi.number().min(1)
}).options({
  abortEarly: false
})

export default ticketValidateSchema