import express from 'express';
import {
  createForFe,
  getAll,
  getDetail,
  remove,
  update,
  deleteSoft,
  getAllInCludeDestroy,
  restore
} from '../controllers/timeSlot.js';
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerTimeSlot = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerTimeSlot.get('/', getAll);
routerTimeSlot.get('/all', getAllInCludeDestroy);
routerTimeSlot.get('/:id', getDetail);
routerTimeSlot.patch('/:id', update);
routerTimeSlot.post('/', createForFe);
routerTimeSlot.delete('/:id', remove);
routerTimeSlot.patch('/:id/soft', deleteSoft);
routerTimeSlot.patch('/:id/restore', restore);


export default routerTimeSlot;
