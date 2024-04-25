/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import { statusScreen } from '../model/ScreenRoom'
import { projectors } from '../model/ScreenRoom'
const screenSchema = Joi.object({
  name: Joi.string().required().min(6).max(255).label('Name').messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  NumberSeat: Joi.number().valid(...[56, 64, 72]),
  projector: Joi.string()
    .valid(...projectors)
    .required(),
  status: Joi.string().valid(...statusScreen),
  CinemaId: Joi.string().allow('').trim().strict(),
  ShowtimesId: Joi.array().items(Joi.string()).min(0),
  destroy: Joi.boolean()
}).options({
  abortEarly: false
})
export default screenSchema
