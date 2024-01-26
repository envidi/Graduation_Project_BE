import express from 'express';
import { create, getAll, getDetail, remove, update } from '../controllers/ticket';
const routerTicket = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerTicket.get('/', getAll);
routerTicket.get('/:id', getDetail);
routerTicket.patch('/:id', update);
routerTicket.post('/', create);
routerTicket.delete('/:id', remove);


export default routerTicket;
