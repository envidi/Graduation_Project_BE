/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import showtimesValidate from '../../validations/showtimes.js'
import Showtimes from '../../model/Showtimes.js'
import Movie from '../../model/Movie.js'
import TimeSlot from '../../model/TimeSlot.js'
import { timeSlotService } from '../TimeSlot/index.js'

export const updateService = async (req) => {
  try {
    const { id } = req.params
    const body = req.body
    const show = await Showtimes.findById(id)
    const timeSlot = await timeSlotService.getTimeSlotIdWithScreenRoomId({
      showTimeId: show._id,
      screenRoomId: show.screenRoomId
    })

    const reqBody = {
      body : {
        ScreenRoomId : show.screenRoomId,
        Show_scheduleId : show._id
      },
      params : {
        id : timeSlot._id
      }
    }
    if (!show) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lịch chiếu không tồn tại')
    }

    // // Kiểm tra validate của dữ liệu đầu vào
    const { error } = showtimesValidate.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message)
    }

    // // Kiểm tra tồn tại của movieId và screenRoomId
    const resultMovieAndScreenRoom = await Promise.all([
      Movie.findById(body.movieId),
      ScreeningRoom.findById(body.screenRoomId)
    ])

    if (!resultMovieAndScreenRoom[0] || !resultMovieAndScreenRoom[1]) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'movieId hoặc screenRoomId không hợp lệ'
      )
    }
    
    // Update lịch chiếu phim
    // const data = await Showtimes.findByIdAndUpdate(id, body, { new: true })

    // Update showTimes in Movie
    // if (show.movieId.toString() !== body.movieId) {
    //   // Remove from the previous movie
    //   await Movie.findByIdAndUpdate(show.movieId, {
    //     $pull: { showTimes: show._id }
    //   })

    //   // Add to the new movie
    //   await Movie.findByIdAndUpdate(body.movieId, {
    //     $addToSet: { showTimes: show._id }
    //   })
    // }

    // Update showTimes in ScreeningRoom
    // await ScreeningRoom.findByIdAndUpdate(body.screenRoomId, {
    //   $push: { showTimes: data._id }
    // })

    // Ensure that the updated showTimes array is retrieved
    // const updatedShow = await Showtimes.findById(id)
    return timeSlot
  } catch (error) {
    throw error
  }
}
