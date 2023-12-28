import express from 'express';
import { create, getAll, getDetail, remove, update } from '../controllers/cinema.js';
const routerCinema = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerCinema.get('/', getAll);
routerCinema.get('/:id', getDetail);
routerCinema.patch('/:id', update);
routerCinema.post('/', create);
routerCinema.delete('/:id', remove);


export default routerCinema;
