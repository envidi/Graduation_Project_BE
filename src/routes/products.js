import express from 'express';
import {
  create,
  getAll,
  getDetail,
  remove,
  update
} from '../controllers/movie.js';
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerProducts = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerProducts.get('/', getAll);
routerProducts.get('/:id', getDetail);
routerProducts.put('/:id', update);
routerProducts.post('/', create);
routerProducts.delete('/:id', remove);


export default routerProducts;
