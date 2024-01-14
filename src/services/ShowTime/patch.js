/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import showtimesValidate from '../../validations/showtimes.js'
import Showtimes from '../../model/Showtimes.js'
import Movie from '../../model/Movie.js'
import { timeSlotService } from '../TimeSlot/index.js'
import { convertTimeToIsoString } from '../../utils/timeLib.js'

import { validateDurationMovie, validateTime } from './post.js'

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
      body: {
        ScreenRoomId: body.screenRoomId.toString(),
        Show_scheduleId: show._id.toString()
      },
      params: {
        id: timeSlot._id.toString()
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
    if (body.movieId !== show.movieId.toString()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot change the movie id')
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
    if (validateDurationMovie(body, resultMovieAndScreenRoom[0])) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Timeframe is not equal to duration of movie'
      )
    }
    if (await validateTime(body, show._id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This time has been set')
    }
    let promises = [
      Showtimes.updateOne(
        { _id: id },
        {
          ...body,
          date: new Date(convertTimeToIsoString(body.date)),
          timeFrom: new Date(convertTimeToIsoString(body.timeFrom)),
          timeTo: new Date(convertTimeToIsoString(body.timeTo))
        }
      )
    ]
    if (body.screenRoomId !== show.screenRoomId) {
      promises.push(timeSlotService.updateService(reqBody))
    }

    // Update lịch chiếu phim
    const result = await Promise.all(promises)

    if (!result || result.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Update timeslot or showtime failed'
      )
    }

    return result
  } catch (error) {
    throw error
  }
}
