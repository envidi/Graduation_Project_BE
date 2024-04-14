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
    .label('ghế')
    .min(1)
    .messages({
      'array.min': 'Phải chọn 1 {{#label}}'
    }),
  userId: Joi.string(),
  totalFood: Joi.number(),
  movieId: Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().required(),
    categoryId: Joi.array().items(
      Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required()
      })
    ),
    image: Joi.string().required()
  }),
  screenRoomId: Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().required()
  }),
  cinemaId: Joi.object({
    _id: Joi.string().required(),
    CinemaName: Joi.string().required(),
    CinemaAdress: Joi.string().required()
  }),
  paymentId: Joi.string(),
  foods: Joi.array().items(
    Joi.object({
      foodId: Joi.string(),
      name: Joi.string(),
      price: Joi.number(),
      quantityFood: Joi.number()
    })
  ),
  showtimeId: Joi.object({
    _id: Joi.string().required(),
    timeFrom: Joi.string().required()
  }),
  quantity: Joi.number().min(1).max(2),
  totalPrice: Joi.number().min(1)
}).options({
  abortEarly: false
})

export default ticketValidateSchema
