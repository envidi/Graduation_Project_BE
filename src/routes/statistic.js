import express from 'express'

import {
  getAgeUser,
  getCountCategories,
  getCountTicketAfterWeek,
  getProfit,
  getRevenueAfterWeek,
  getSexUser,
  getTop4Food,
  getTop5MovieRevenue,
  getTop5UserRevenue
} from '../controllers/statistic'
const routerStatistic = express.Router()

routerStatistic.get('/profit', getProfit)
routerStatistic.get('/countCate', getCountCategories)
routerStatistic.get('/countTicket', getCountTicketAfterWeek)
routerStatistic.get('/topmovie', getTop5MovieRevenue)
routerStatistic.get('/topuser', getTop5UserRevenue)
routerStatistic.get('/topfood', getTop4Food)
routerStatistic.get('/sex', getSexUser)
routerStatistic.get('/age', getAgeUser)
routerStatistic.get('/revenueWeek', getRevenueAfterWeek)

export default routerStatistic
