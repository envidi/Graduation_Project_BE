import Joi from 'joi'

const ticketValidateSchema = Joi.object({
  priceId: Joi.string().required(),
  seatId: Joi.array().items(Joi.string()).required().min(1),
  foods: Joi.array().items(Joi.object({
    foodId: Joi.string().required(),
    quantityFood: Joi.number().required().min(0)
  })),
  showtimeId: Joi.string().required().trim(),
  quantity: Joi.number().min(1).max(2),
  totalPrice: Joi.number().min(1)
}).options({
  abortEarly: false
})

export default ticketValidateSchema