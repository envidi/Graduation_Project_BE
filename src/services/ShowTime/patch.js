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
import ScreenRoom from '../../model/ScreenRoom.js'
import Seat from '../../model/Seat.js'

export const updateService = async (req) => {
  try {
    const { id } = req.params
    const body = req.body

    const [show, { CinemaId: currentCinema }] = await Promise.all([
      Showtimes.findById(id).populate('screenRoomId'),
      ScreenRoom.findById(body.screenRoomId)
    ])

    if (!show || Object.keys(show).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Showtime id not found')
    }
    // Không thể chuyển lịch chiếu sang rạp khác

    if (show.screenRoomId.CinemaId.toString() != currentCinema.toString()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot change showtime into another cinema'
      )
    }
    // const timeSlot = await timeSlotService.getTimeSlotIdWithScreenRoomId({
    //   showTimeId: show._id,
    //   screenRoomId: show.screenRoomId
    // })

    // const reqBody = {
    //   body: {
    //     ScreenRoomId: body.screenRoomId.toString(),
    //     Show_scheduleId: show._id.toString()
    //   },
    //   params: {
    //     id: timeSlot._id.toString()
    //   }
    // }

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
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot change status schedule into full'
      )
    }
    // Nếu như lịch chiếu đã bị xóa mềm thì không thể sửa
    if (show.destroy) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This timeslot is deleted soft'
      )
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
    if (body.status === CANCELLED_SCHEDULE && !(await checkSomeSeatSold(id))) {
      const updateShowtimetCancelled = await Showtimes.findOneAndUpdate(
        { _id: id },
        { status: CANCELLED_SCHEDULE },
        { new: true }
      )
      if (
        !updateShowtimetCancelled ||
        Object.keys(updateShowtimetCancelled).length === 0
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Update showtime status to cancelled failed'
        )
      }
    }
    // Nếu như status hiện tại khác khi sửa và khác trạng thái đã hủy
    if (body.status !== show.status && body.status !== CANCELLED_SCHEDULE) {
      promises.push(
        Showtimes.findOneAndUpdate(
          { _id: id },
          {
            status: body.status
          },
          { new: true }
        )
      )
    }
    //  Thay đổi lịch chiếu sang phòng khác
    if (body.screenRoomId !== show.screenRoomId) {
      // Lấy ra screen cũ
      const screenRoomOld = await ScreenRoom.findById(show.screenRoomId)
      // Lấy ra screen mới
      const screenRoomNew = await ScreenRoom.findById(body.screenRoomId)

      // Cập nhật screen mới , thêm timeslot hiện tại vào screen mới
      // Cập nhật screen cũ , xóa timeslot hiện tại khỏi screen cũ
      // Đặt lại screen id trong tất cả ghế của timeslot hiện tại
      promises.push(
        ScreenRoom.updateOne(
          { _id: screenRoomNew._id },
          {
            $addToSet: {
              ShowtimesId: id
            }
          }
        )
      )
      promises.push(
        ScreenRoom.updateOne(
          { _id: screenRoomOld._id },
          {
            $pull: {
              ShowtimesId: id
            }
          }
        )
      )
      promises.push(
        Seat.updateMany(
          {
            _id: {
              $in: show.SeatId
            }
          },
          {
            $set: {
              ScreeningRoomId: body.screenRoomId
            }
          }
        )
      )

      // // Nếu như screen id mới không tồn tại trong database thì không cho phép sửa
      if (!screenRoomNew || Object.keys(screenRoomNew).length === 0) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'This new screen room is not exist in database'
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
