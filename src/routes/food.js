import express from 'express';
import { getAll, getDetail, create, update, remove } from '../controllers/food';
const routerFood = express.Router();

// routerFood.get('/', verifyAccessToken, getAll);
// routerFood.get('/:id', verifyAccessToken, getDetail);
// routerFood.put('/:id', verifyAccessToken, isAdmin, update);
// routerFood.post('/', verifyAccessToken, isAdmin, create);
// routerFood.delete('/:id', verifyAccessToken, isAdmin, remove);

routerFood.get('/', getAll);
routerFood.get('/:id', getDetail);
routerFood.post('/', create);
routerFood.patch('/:id', update);
routerFood.delete('/:id', remove);


export default routerFood;
