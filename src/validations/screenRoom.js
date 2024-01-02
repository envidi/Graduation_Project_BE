/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import { statusScreen } from '../model/ScreenRoom'
const screenSchema = Joi.object({
  name: Joi.string().required().min(6).max(255).label('Name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  status: Joi.string().min(1).max(255).valid(...statusScreen),
  SeatId: Joi.array().items(Joi.string().trim().strict()).min(1),
  CinemaId: Joi.string().required().min(1).max(255).trim().strict(),
  show_scheduleId: Joi.array().items(Joi.string().trim().strict()).required(),
  destroy: Joi.boolean()
}).options({
  abortEarly: false
})
export default screenSchema
