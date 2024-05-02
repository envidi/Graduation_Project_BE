/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import { statusSeat } from '../model/Seat'
const seatSchema = Joi.object({
<<<<<<< HEAD
  name: Joi.string().required().min(6).max(255).label('name').trim().strict().messages({
    'string.empty': `{{ #label }} is 'required'`
  }),
  typeSeat: Joi.string().required().min(6).max(255).label('typeSeat').trim().strict().messages({
=======
  typeSeat: Joi.string().required().min(1).max(255).label('typeSeat').trim().strict().messages({
>>>>>>> 57763df6c7ae1c5811723b00434ebd68eced301d
    'string.empty': `{{ #label }} is 'required'`
  }),
  price: Joi.number().min(1).max(200000),
  row: Joi.number().required().min(0).max(255),
  column: Joi.number().required().min(0).max(255),
  status: Joi.string().valid(...statusSeat).trim().strict(),
  ScreeningRoomId: Joi.string().required().trim().strict(),
  ShowScheduleId: Joi.string().required().trim().strict()
}).options({
  abortEarly: false
})
export default seatSchema
