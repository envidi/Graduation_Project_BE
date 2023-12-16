import routerUser from './user.js';
import { Router } from 'express';

const routerInit = Router();

routerInit.use('/user', routerUser )


export default routerInit;