import routerProducts from './movie.js';
import routerCategory from './category.js';
import routerUser from './user.js';
import { Router } from 'express';

const routerInit = Router();

routerInit.use('/user', routerUser )
routerInit.use('/product', routerProducts )
routerInit.use('/category', routerCategory )


export default routerInit;