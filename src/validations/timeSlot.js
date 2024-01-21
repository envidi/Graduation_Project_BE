/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import { statusTimeSlot } from '../model/TimeSlot.js'

const timeSlotSchema = Joi.object({
  ScreenRoomId: Joi.string().required().trim().strict(),
  Show_scheduleId: Joi.string().required().trim().strict(),
  SeatId: Joi.array().items(Joi.string().trim().strict()),
  status : Joi.string().valid(...statusTimeSlot),
  destroy: Joi.boolean()
}).options({
  abortEarly: false
})
export default timeSlotSchema
