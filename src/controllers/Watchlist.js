import { StatusCodes } from 'http-status-codes'
import { watchListService } from '../services/WatchList'
export const getAll = async (req, res, next) => {
  try {
    const data = await watchListService.getAllService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const create = async (req, res, next) => {
  try {
    const data = await watchListService.createService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const remove = async (req, res, next) => {
  try {
    const data = await watchListService.removeHardService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
