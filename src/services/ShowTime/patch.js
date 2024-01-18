/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import showtimesValidate from '../../validations/showtimes.js'
import Showtimes, {
  AVAILABLE_SCHEDULE,
  CANCELLED_SCHEDULE,
  FULL_SCHEDULE
} from '../../model/Showtimes.js'
import Movie from '../../model/Movie.js'
import { timeSlotService } from '../TimeSlot/index.js'
import { convertTimeToIsoString } from '../../utils/timeLib.js'

import { validateDurationMovie, validateTime } from './post.js'
import { checkSomeSeatSold } from '../TimeSlot/patch.js'
import { CANCELLED_TIMESLOT } from '../../model/TimeSlot.js'

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

    if (!show || Object.keys(show).length === 0) {
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
    if (body.status === FULL_SCHEDULE) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot change status schedule into full')
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
    // nếu như muốn hủy lịch chiếu thì phải kiểm tra xem tất cả ghế
    // trong lịch chiếu đã được đặt chưa
    if (
      body.status === CANCELLED_SCHEDULE &&
      !(await checkSomeSeatSold(timeSlot._id))
    ) {
      const updateTimeSlotCancelled = await timeSlotService.updateStatus(
        timeSlot._id,
        { status: CANCELLED_TIMESLOT }
      )
      if (
        !updateTimeSlotCancelled ||
        Object.keys(updateTimeSlotCancelled).length === 0
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Update timeslot status to cancelled failed'
        )
      }
    }
    if (body.status !== show.status && body.status !== CANCELLED_SCHEDULE) {
      promises.push(
        timeSlotService.updateStatus(timeSlot._id, {
          status: AVAILABLE_SCHEDULE
        })
      )
    }
    //  Thay đổi lịch chiếu sang phòng khác
    if (body.screenRoomId !== show.screenRoomId) {
      const updateTimeSlot = await timeSlotService.updateService(reqBody)
      if (!updateTimeSlot || updateTimeSlot.length === 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Update timeslot failed when update showtime'
        )
      }
    }

    // Update lịch chiếu phim
    const result = await Promise.all(promises).catch((error) => {
      throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
    })

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

export const updateStatusFull = async (id, body) => {
  try {
    const updateShowTime = await Showtimes.updateOne({ _id: id }, body, {
      new: true
    })
    return updateShowTime
  } catch (error) {
    throw error
  }
}
