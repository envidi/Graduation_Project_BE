import routerProducts from './movie.js'
import routerCategory from './category.js'
import routerUser from './user.js'
import { Router } from 'express'
import routerRoleUser from './roleUser.js'
<<<<<<< HEAD
import routerCinema from './cinema.js'
import seatRouter from './seat.js'
import screenRoom from './screenRoom.js'
import routerMoviePrice from './MoviePrice.js'
=======
import routerCinema from './cinema.js';
import seatRouter from './seat.js';
import screenRoom from './screenRoom.js';
import routerFood from './food.js';
>>>>>>> 027e7910912940bfc81781b5ff0c8631b6e459a4

const routerInit = Router()

routerInit.use('/user', routerUser)
routerInit.use('/product', routerProducts)
routerInit.use('/category', routerCategory)
routerInit.use('/cinema', routerCinema)
routerInit.use('/roleUser', routerRoleUser)
routerInit.use('/seat', seatRouter)
routerInit.use('/screen', screenRoom)
<<<<<<< HEAD
routerInit.use('/movie/price', routerMoviePrice)
export default routerInit
=======
routerInit.use('/food', routerFood)

export default routerInit;
>>>>>>> 027e7910912940bfc81781b5ff0c8631b6e459a4
