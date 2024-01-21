import routerProducts from './movie.js'
import routerCategory from './category.js'
import routerUser from './user.js'
import { Router } from 'express'
import routerRoleUser from './roleUser.js'
import routerCinema from './cinema.js';
import seatRouter from './seat.js';
import screenRoom from './screenRoom.js';
import routerMoviePrice from './MoviePrice.js'
import routerTimeSlot from './timeSlot.js'
import routerFood from './food.js'
import ShowtimesRouter from './showtimes.js';
import routerEmail from './email.js'
const routerInit = Router()

routerInit.use('/user', routerUser)
routerInit.use('/movie', routerProducts)
routerInit.use('/category', routerCategory)
routerInit.use('/cinema', routerCinema)
routerInit.use('/roleUser', routerRoleUser)
routerInit.use('/seat', seatRouter)
routerInit.use('/screen', screenRoom)
routerInit.use('/food', routerFood)
routerInit.use('/timeslot', routerTimeSlot)
routerInit.use('/movie/price', routerMoviePrice)
routerInit.use('/showtimes', ShowtimesRouter)
routerInit.use('/email', routerEmail )

export default routerInit;