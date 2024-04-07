import Joi from 'joi'

const ticketValidateSchema = Joi.object({
  priceId: Joi.object({
    _id: Joi.string().required(),
    price: Joi.number().required()
  }).required(),
  typeBank: Joi.string(),
  typePayment: Joi.string(),
  amount: Joi.string(),
  seatId: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().required(),
        typeSeat: Joi.string().required(),
        price: Joi.number().required(),
        row: Joi.number().required(),
        column: Joi.number().required()
      })
    )
    .required()
    .min(1),
  userId: Joi.string(),
  totalFood : Joi.number(),
  movieId: Joi.string(),
  screenRoomId: Joi.string(),
  cinemaId: Joi.string(),
  paymentId: Joi.string(),
  foods: Joi.array().items(
    Joi.object({
      foodId: Joi.string(),
      name: Joi.string(),
      price: Joi.number(),
      quantityFood: Joi.number()
    })
  ),
  showtimeId: Joi.string().required().trim(),
  quantity: Joi.number().min(1).max(2),
  totalPrice: Joi.number().min(1)
}).options({
  abortEarly: false
})

export default ticketValidateSchema
