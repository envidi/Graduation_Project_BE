/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import WatchList from '../../model/WatchList'
import ApiError from '../../utils/ApiError'
export const createService = async (req) => {
  try {
    const body = req.body
    const existWatchList = await WatchList.findOne({
      movieId: req.body.movieId
    })
    if (existWatchList && Object.keys(existWatchList).length > 0) {
      throw new ApiError(StatusCodes.CONFLICT, 'Watch list is exist!')
    }

    const data = await WatchList.create({
      ...body
    })

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create watchlist failed!')
    }
    // Tạo ra mảng array của category

    return data
  } catch (error) {
    throw error
  }
}
