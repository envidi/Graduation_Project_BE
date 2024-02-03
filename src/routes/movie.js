import express from 'express';
import {
  create,
  getAll,
  getAllSoftDelete,
  getDetail,
  remove,
  restore,
  softDelete,
  update
} from '../controllers/movie.js';

import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
import { upload } from '../middleware/multer.js';

// import { checkPermission } from "../middlewares/checkPermission";
const routerProducts = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerProducts.get('/', getAll);
routerProducts.get('/softdelete', getAllSoftDelete);
routerProducts.get('/:id', getDetail);
routerProducts.patch('/:id', upload.single('image'), update);
routerProducts.post('/', upload.single('image'), create);
routerProducts.delete('/:id', remove);
routerProducts.patch('/softdelete/:id', softDelete);
routerProducts.patch('/restore/:id', restore);


export default routerProducts;
