/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi'
import JoiDate from '@joi/date';
import { statusScreen } from '../model/Showtimes'

// kiểu giờ
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/

const JoiExtended = Joi.extend(JoiDate);
const showtimesValidate = JoiExtended.object({
  date: JoiExtended.date().format(['YYYY/MM/DD HH:mm', 'DD-MM-YYYY HH:mm']).min('now').required().label('date').messages({
    'date.empty': '{{ #label }} is required'
  }),
  timeFrom: JoiExtended.date().format('DD-MM-YYYY HH:mm').min('now').required().label('timeFrom').messages({
    'string.pattern.base': '{{ #label }} must be in HH:mm AM/PM format',
    'string.empty': '{{ #label }} is required'
  }),
  timeTo: JoiExtended.date().format('DD-MM-YYYY HH:mm').min(Joi.ref('timeFrom')).required().label('timeTo').messages({
    'string.pattern.base': '{{ #label }} must be in HH:mm AM/PM format',
    'string.empty': '{{ #label }} is required'
  }),
  status: Joi.string().min(1).max(255),
  screenRoomId: Joi.string().required().min(1).max(255).trim().strict(),
  movieId: Joi.string().required().min(1).max(255).trim().strict(),
}).options({
  abortEarly: false
});
export default showtimesValidate
