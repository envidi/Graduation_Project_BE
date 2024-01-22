import express from 'express'

// import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
import {
  createShowTime,
  deleteShow,
  deleteSoftShow,
  getAllIncludeDestroy,
  getAllShow,
  getDetailShow,
  restoreShow,
  updateShowTime
} from '../controllers/showtimes.js'
const ShowtimesRouter = express.Router()

ShowtimesRouter.post('/', createShowTime)
ShowtimesRouter.get('/', getAllShow)
ShowtimesRouter.get('/all', getAllIncludeDestroy)
ShowtimesRouter.get('/:id', getDetailShow)
ShowtimesRouter.delete('/:id', deleteShow)
ShowtimesRouter.patch('/:id', updateShowTime)
ShowtimesRouter.patch('/:id/soft', deleteSoftShow)
ShowtimesRouter.patch('/:id/restore', restoreShow)

export default ShowtimesRouter
