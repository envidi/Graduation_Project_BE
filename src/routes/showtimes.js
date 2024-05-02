import express from 'express'

// import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
import {
  createShowTime,
  deleteShow,
  deleteSoftShow,
  getAllApprovalShow,
  getAllIncludeDestroy,
  getAllShow,
  getDetailShow,
  restoreShow,
  updateApprovalShowTime,
  updateMovieShowTime,
  updateShowTime
} from '../controllers/showtimes.js'
const ShowtimesRouter = express.Router()

ShowtimesRouter.post('/', createShowTime)
ShowtimesRouter.get('/', getAllShow)
ShowtimesRouter.get('/approval', getAllApprovalShow)
ShowtimesRouter.get('/all', getAllIncludeDestroy)
ShowtimesRouter.get('/:id', getDetailShow)
ShowtimesRouter.delete('/:id', deleteShow)
ShowtimesRouter.patch('/:id', updateShowTime)
ShowtimesRouter.patch('/exchange/:id', updateMovieShowTime)
ShowtimesRouter.patch('/:id/soft', deleteSoftShow)
ShowtimesRouter.patch('/:id/restore', restoreShow)
ShowtimesRouter.patch('/:id/approval', updateApprovalShowTime)

export default ShowtimesRouter
