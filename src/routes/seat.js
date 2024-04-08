import express from 'express';
import {
  create,
  getAll,
  getAllByShowTime,
  getDetail,
  getSeatByShowTime,
  remove,
  update
} from '../controllers/seat.js';
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerSeat = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerSeat.get('/all', getAll);
routerSeat.get('/', getAllByShowTime);
routerSeat.get('/show', getSeatByShowTime);
routerSeat.get('/:id', getDetail);
routerSeat.patch('/:id', update);
routerSeat.post('/', create);
routerSeat.delete('/:id', remove);


export default routerSeat;
