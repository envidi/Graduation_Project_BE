import routerProducts from './movie.js';
import routerCategory from './category.js';
import routerUser from './user.js';
import { Router } from 'express';
import routerRoleUser from './roleUser.js'
import routerCinema from './cinema.js';
import seatRouter from './seat.js';
import screenRoom from './screenRoom.js';
import routerFood from './food.js';

const routerInit = Router()

routerInit.use('/user', routerUser)
routerInit.use('/product', routerProducts)
routerInit.use('/category', routerCategory)
routerInit.use('/cinema', routerCinema)
routerInit.use('/roleUser', routerRoleUser)
routerInit.use('/seat', seatRouter)
routerInit.use('/screen', screenRoom)
routerInit.use('/food', routerFood)

export default routerInit;