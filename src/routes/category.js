import express from 'express';
import {
  create,
  getAll,
  getDetail,
  remove,
  update
} from '../controllers/category.js';
// import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerCategory = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerCategory.get('/', getAll);
routerCategory.get('/query', getDetail);
routerCategory.patch('/:id', update);
routerCategory.post('/', create);
routerCategory.delete('/:id', remove);


export default routerCategory;
