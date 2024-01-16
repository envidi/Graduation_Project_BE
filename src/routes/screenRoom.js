import express from 'express';
import {
  createForPostMan,
  createForFe,
  getAll,
  getDetail,
  remove,
  update,
  deleteSoft,
  getAllInCludeDestroy,
  restore
} from '../controllers/screenRoom.js';
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerScreenRoom = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerScreenRoom.get('/', getAll);
routerScreenRoom.get('/all', getAllInCludeDestroy);
routerScreenRoom.get('/:id', getDetail);
routerScreenRoom.patch('/:id', update);
routerScreenRoom.post('/be', createForPostMan);
routerScreenRoom.post('/', createForFe);
routerScreenRoom.delete('/:id', remove);
routerScreenRoom.patch('/:id/soft', deleteSoft);
routerScreenRoom.patch('/:id/restore', restore);


export default routerScreenRoom;
