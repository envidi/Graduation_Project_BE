/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import { statusScreen } from '../model/Showtimes'

const showtimesValidate = Joi.object({
  date: Joi.string().required().label('date').messages({
    'string.empty': '{{ #label }} is required'
  }),
  times: Joi.string().required().label('times').messages({
    'string.empty': '{{ #label }} is required'
  }),
  status: Joi.string().min(1).max(255),
  screenRoomId: Joi.string().required().min(1).max(255).trim().strict(),
  movieId: Joi.string().required().min(1).max(255).trim().strict()
}).options({
  abortEarly: false
});
export default showtimesValidate
