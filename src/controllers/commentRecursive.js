import { commentRecursiveService } from '../services/CommentRecursive'
import { StatusCodes } from 'http-status-codes'

export const getAll = async (req, res, next) => {
  try {
    const data = await commentRecursiveService.getAllService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}
export const getAllByMovie = async (req, res, next) => {
  try {
    const data = await commentRecursiveService.getAllByMovieService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}
export const deleteCommentRecursive = async (req, res, next) => {
  try {
    const data = await commentRecursiveService.removeService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}