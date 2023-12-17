import Joi from 'joi';

const categorySchema = Joi.object({
  name: Joi.string().required().min(1),
  isDeleteable: Joi.boolean(),
  products: Joi.array().items(Joi.string()).min(1).required()
}).options({
  abortEarly: false
});

export default categorySchema;