import express from 'express'

import { verifyAccessPaymentToken } from '../middleware/verifyToken'
import { getAgeUser, getProfit, getRevenueAfterWeek, getSexUser, getTop5MovieRevenue } from '../controllers/statistic'
const routerStatistic = express.Router()

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerStatistic.get('/profit', getProfit)
routerStatistic.get('/topmovie', getTop5MovieRevenue)
routerStatistic.get('/sex', getSexUser)
routerStatistic.get('/age', getAgeUser)
routerStatistic.get('/revenueWeek', getRevenueAfterWeek)


export default routerStatistic
