/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import { statusScreen } from '../model/Showtimes'

// kiểu giờ
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/
const showtimesValidate = Joi.object({
  date: Joi.date().required().label('date').messages({
    'date.empty': '{{ #label }} is required',
  }),
  times: Joi.string().regex(timeRegex).required().label('times').messages({
    'string.pattern.base': '{{ #label }} must be in HH:mm AM/PM format',
    'string.empty': '{{ #label }} is required',
  }),
  status: Joi.string().min(1).max(255),
  screenRoomId: Joi.string().required().min(1).max(255).trim().strict(),
  movieId: Joi.string().required().min(1).max(255).trim().strict(),
}).options({
  abortEarly: false,
});
export default showtimesValidate
