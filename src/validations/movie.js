/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import JoiDate from '@joi/date'
// import { moviePriceSchema } from './MoviePrice'

const JoiExtended = Joi.extend(JoiDate)
const movieSchema = JoiExtended.object({
  name: Joi.string().required().min(6).max(255).label('Name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  desc: Joi.string().min(3).max(255).trim().strict(),

  author: Joi.string().required().min(1).max(255).trim().strict(),
  image: Joi.string().required().min(1).max(255).trim().strict(),
  duration: Joi.number().required().min(30).max(300),
  country: Joi.string().required().min(1).max(100).trim().strict(),
  trailer: Joi.string().required().min(1),
  age_limit: Joi.number().required().min(1).max(100),
  categoryId: Joi.array().items(Joi.string()).required(),
  fromDate: JoiExtended.date().format(['YYYY/MM/DD HH:mm', 'DD-MM-YYYY HH:mm']).required().min('now'),
  toDate: JoiExtended.date().format(['YYYY/MM/DD HH:mm', 'DD-MM-YYYY HH:mm']).required().greater(Joi.ref('fromDate')),
  status: Joi.string().required().min(1).max(255).valid('COMING_SOON', 'IS_SHOWING', 'PRTMIERED', 'CANCELLED'),
  rate: Joi.number().required().min(1).max(5),
  // Trong array của show_schedule thêm một object có trường id và name
  showTimes: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required()
      })
    )
    .min(0)
    .required(),
  // Movie Price
  prices: Joi.array()
    .items(
      Joi.object({
        price: Joi.number().required().min(0),
        dayType: Joi.string().required().valid('weekday', 'weekend')
      })
    )
    .min(0)
    // .required()
}).options({
  abortEarly: false
})
export default movieSchema
