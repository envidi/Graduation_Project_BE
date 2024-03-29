/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import { statusScreen } from '../model/ScreenRoom'

const screenSchema = Joi.object({
  name: Joi.string().required().min(6).max(255).label('Name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  status : Joi.string().valid(...statusScreen),
  CinemaId: Joi.string().required().min(1).max(255).trim().strict(),
  TimeSlotId: Joi.array().items(Joi.string()).required().min(0).max(255),
  destroy: Joi.boolean()
}).options({
  abortEarly: false
})
export default screenSchema
