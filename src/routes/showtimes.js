import express from 'express'

import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
import {
  createShowTime,
  deleteShow,
  getAllShow,
  getDetailShow,
  updateShowTime
} from '../controllers/showtimes.js'
const ShowtimesRouter = express.Router()

ShowtimesRouter.post('/', createShowTime)
ShowtimesRouter.put('/:id', updateShowTime)
ShowtimesRouter.get('/', getAllShow)
ShowtimesRouter.get('/:id', getDetailShow)
ShowtimesRouter.delete('/:id', deleteShow)

export default ShowtimesRouter
