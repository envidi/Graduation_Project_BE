import Joi from 'joi'

const commentValidationSchema = Joi.object({
  userId: Joi.string().trim().required(),
  movieId: Joi.string().required(),
  parentId: Joi.string(),
  like: Joi.number().min(0),
  comments: Joi.array().empty(Joi.array().length(0)),
  content: Joi.string().min(0).required(),
  // empty: Joi.boolean().required()
}).options({
  abortEarly: false
})
export const replyCommentValidationSchema = Joi.object({
  userId: Joi.string().trim().required(),
  movieId: Joi.string().required(),
  parentId: Joi.string().required(),
  like: Joi.number().min(0),
  comments: Joi.array().empty(Joi.array().length(0)),
  content: Joi.string().min(0).required()
}).options({
  abortEarly: false
})
export default commentValidationSchema
