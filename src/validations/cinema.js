import Joi from 'joi';

const CinemaSchema = Joi.object({
  CinemaName: Joi.string().required().min(1).trim().strict(),
  CinemaAdress: Joi.string().required(),
  ScreeningRoomId: Joi.array().items(Joi.string())
}).options({
  abortEarly: false
});
export default CinemaSchema;