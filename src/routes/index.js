import routerProducts from './movie.js';
import routerCategory from './category.js';
import routerUser from './user.js';
import { Router } from 'express';
import routerCinema from './cinema.js';

const routerInit = Router();

routerInit.use('/user', routerUser )
routerInit.use('/product', routerProducts )
routerInit.use('/category', routerCategory )
routerInit.use('/cinema', routerCinema )


export default routerInit; 