import Joi from 'joi';

const categorySchema = Joi.object({
  name: Joi.string().required().min(1).trim().strict(),
  isDeleteable: Joi.boolean(),
  products: Joi.array().items(Joi.string())
}).options({
  abortEarly: false
});

export default categorySchema; 