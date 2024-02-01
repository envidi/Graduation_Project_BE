

import { StatusCodes } from 'http-status-codes'
import Showtimes from '../../model/Showtimes.js'
import ApiError from '../../utils/ApiError.js'
import Movie from '../../model/Movie.js'

export const softDeleteService = async (req, res, next) => {
    try {
      const id = req.params.id
      // check suat chieu
      const checkshowtimes = await Showtimes.find({ movieId: id })
      const showtime = await checkshowtimes[0]
      if (showtime != undefined) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Movies that have already been released cannot be deleted !')
      }
      const data = await Movie.updateOne({ _id: id }, { destroy: true });
      if (!data) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Soft Delete movie failed!')
      }
      return data
    //   return res.status(StatusCodes.OK).json({
    //     message: 'Success!',
    //     data
    //   })
    } catch (error) {
      throw error

      next(error)
    }
  }
  export const restoreService = async (req, res, next) => {
    try {
      const id = req.params.id
      // check suat chieu
      const checkshowtimes = await Showtimes.find({ movieId: id })
      const showtime = await checkshowtimes[0]
      if (showtime != undefined) {
        throw new ApiError(StatusCodes.NOT_FOUND, '')
      }
      const data = await Movie.updateOne({ _id: id }, { destroy: false });
      if (!data) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Movie restore failed !')
      }
      return data

    } catch (error) {
      next(error)
      throw error

    }
  }
  export const removeService = async (req, res, next) => {
    try {
      const id = req.params.id
      // check suat chieu nếu có thì k xóa dc
      const checkshowtimes = await Showtimes.find({ movieId: id })
      const showtime = await checkshowtimes[0]
      if (showtime != undefined) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Movies that are currently showing cannot be deleted !')
      }
      // console.log(showtime.movieId == id)
  
      // check status
      const checkmovie = await Movie.findById(id)
      if (checkmovie.status == 'IS_SHOWING') {
        console.log(checkmovie)
        throw new ApiError(StatusCodes.NOT_FOUND, 'Movies that are currently showing cannot be deleted !')
      }
  
      const data = await Movie.findOneAndDelete({ _id: id })
  
      // get all price of movie
      const prices = data.prices
      //loop and delete all price of movie
  
      for (let i = 0; i < prices.length; i++) {
        await moviePriceService.remove(prices[i])
      }
  
      if (!data) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete movie failed!')
      }
      return data
    //   return res.status(StatusCodes.OK).json({
    //     message: 'Success!',
    //     data
    //   })
    } catch (error) {
      throw error
      next(error)
    }
  }
  