/* eslint-disable @stylistic/js/quotes */
import Joi from 'joi';

// Remove JoiDate import if not used
import JoiDate from '@joi/date';
import { statusScreen } from '../model/Showtimes'
// kiểu giờ
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/


const JoiExtended = Joi.extend(JoiDate);

const showtimesValidate = JoiExtended.object({
  date: JoiExtended.date().format([ 'DD-MM-YYYY HH:mm']).min('now').required().label('Ngày Khởi Chiếu').messages({
    'date.empty': '{{ #label }} là bắt buộc',
    'date.min': ' Thời gian {{ #label }} phải lớn hơn hoặc bằng hiện tại '

  }),

  timeFrom: JoiExtended.date().format('DD-MM-YYYY HH:mm').min('now').required().label('Thời gian khởi chiếu').messages({
    'date.format': '{{ #label }} phải ở định dạng DD-MM-YYYY HH:mm',
    'date.empty': '{{ #label }} là bắt buộc',
    'date.min': ' {{ #label }} phải lớn hơn hoặc bằng thời gian hiện tại'
  }),

  timeTo: JoiExtended.date().format('DD-MM-YYYY HH:mm').min(Joi.ref('timeFrom')).required().label('Thời gian kết thúc').messages({
    'date.format': '{{ #label }} phải ở định dạng DD-MM-YYYY HH:mm',
    'date.empty': '{{ #label }} là bắt buộc',
    'date.min': '{{ #label }} phải lớn hơn thời gian bắt đầu'
  }),

  status: Joi.string().min(1).max(255),
  screenRoomId: Joi.string().required().min(1).max(255).label('ID Phòng chiếu').messages({
    'string.empty': '{{ #label }} là bắt buộc',
    'any.required': '{{ #label }} là bắt buộc'
  }),
  SeatId: Joi.array().items(Joi.string().trim().strict()),

  movieId: Joi.string().required().min(1).max(255).label('ID Phim').messages({
    'string.empty': '{{ #label }} là bắt buộc',
    'any.required': '{{ #label }} là bắt buộc'
  })
}).options({
  abortEarly: false
});


export default showtimesValidate;
