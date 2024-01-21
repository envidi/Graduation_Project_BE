import Joi from 'joi'

export const moviePriceSchema = Joi.object({
  movieId: Joi.array().required(),
  price: Joi.number().required().min(0),
  dayType: Joi.string().required().valid('weekday', 'weekend')
}).options({
  abortEarly: false
})

export const updateMoviePriceSchema = Joi.object({
  price: Joi.number().required().min(0)
}).options({
  abortEarly: false
})
