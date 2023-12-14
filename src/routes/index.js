import routerProducts from './products.js';
import routerUser from './user.js';
import { Router } from 'express';

const routerInit = Router();

routerInit.use('/user', routerUser )
routerInit.use('/pruduct', routerProducts )


export default routerInit;