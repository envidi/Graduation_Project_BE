/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi';

// Remove JoiDate import if not used
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
    'date.format': '{{ #label }} must be in DD-MM-YYYY HH:mm format',
    'date.empty': '{{ #label }} is required'
  }),

  timeTo: JoiExtended.date().format('DD-MM-YYYY HH:mm').min(Joi.ref('timeFrom')).required().label('timeTo').messages({
    'date.format': '{{ #label }} must be in DD-MM-YYYY HH:mm format',
    'date.empty': '{{ #label }} is required'
  }),

  status: Joi.string().min(1).max(255),
  screenRoomId: Joi.string().required().min(1).max(255).label('screenRoomId').messages({
    'string.empty': '{{ #label }} is required',
    'any.required': '{{ #label }} is required'
  }),
  SeatId: Joi.array().items(Joi.string().trim().strict()),

  movieId: Joi.string().required().min(1).max(255).label('movieId').messages({
    'string.empty': '{{ #label }} is required',
    'any.required': '{{ #label }} is required'
  })
}).options({
  abortEarly: false
});

export default showtimesValidate;

