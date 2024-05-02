/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import showtimesValidate from '../../validations/showtimes.js'
import Showtimes, {
  AVAILABLE_SCHEDULE,
  // AVAILABLE_SCHEDULE,
  CANCELLED_SCHEDULE,
  FULL_SCHEDULE
} from '../../model/Showtimes.js'
import Movie, { COMING_SOON, IS_SHOWING } from '../../model/Movie.js'
// import { timeSlotService } from '../TimeSlot/index.js'
import { convertTimeToIsoString } from '../../utils/timeLib.js'

import { validateDurationMovie, validateTime } from './post.js'
import { checkSomeSeatSold } from '../TimeSlot/patch.js'
// import { CANCELLED_TIMESLOT } from '../../model/TimeSlot.js'
import ScreenRoom from '../../model/ScreenRoom.js'
import Seat from '../../model/Seat.js'
import { insertSeatIntoScreen } from '../Seat/post.js'
import { getRowAndCol } from '../../utils/getRowAndCol.js'

export const updateService = async (req) => {
  try {
    const { id } = req.params
    const body = req.body

    const [show] = await Promise.all([
      Showtimes.findById(id).populate('screenRoomId')
    ])

    if (!show || Object.keys(show).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy lịch chiếu')
    }

    // // Kiểm tra validate của dữ liệu đầu vào
    const { error } = showtimesValidate.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message)
    }

    if (body.movieId !== show.movieId.toString()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể thay đổi phim')
    }
    if (body.status === FULL_SCHEDULE) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Không thể thay đổi lịch trạng thái thành full'
      )
    }
    // Nếu như lịch chiếu đã bị xóa mềm thì không thể sửa
    if (show.destroy) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Lịch chiếu đã bị xóa mềm')
    }

    // // Kiểm tra tồn tại của movieId và screenRoomId
    const resultMovieAndScreenRoom = await Promise.all([
      Movie.findById(body.movieId),
      ScreeningRoom.findById(body.screenRoomId)
    ])

    if (!resultMovieAndScreenRoom[0] || !resultMovieAndScreenRoom[1]) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'MovieId hoặc ScreenRoomId không hợp lệ'
      )
    }
    if (validateDurationMovie(body, resultMovieAndScreenRoom[0])) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Khung thời gian không bằng thời lượng phim'
      )
    }
    if (await validateTime(body, show._id)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Khoảng thời gian này đã tồn tại'
      )
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
          'Cập nhật trạng thái lịch chiếu thành đã hủy không thành công'
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
    if (body.screenRoomId.toString() !== show.screenRoomId._id.toString()) {
      // Lấy ra screen cũ
      const screenRoomOld = await ScreenRoom.findById(show.screenRoomId._id)
      // Lấy ra screen mới
      const screenRoomNew = await ScreenRoom.findById(body.screenRoomId)

      // Cập nhật screen mới , thêm timeslot hiện tại vào screen mới
      // Cập nhật screen cũ , xóa timeslot hiện tại khỏi screen cũ
      // Đặt lại screen id trong tất cả ghế của timeslot hiện tại
      if (!screenRoomNew || Object.keys(screenRoomNew).length === 0) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Phòng chiếu mới này không tồn tại trong cơ sở dữ liệu'
        )
      }
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
      if (
        show.screenRoomId.NumberSeat !== resultMovieAndScreenRoom[1].NumberSeat
      ) {
        const data = {
          _id: id,
          screenRoomId: body.screenRoomId
        }
        const { row, column } = getRowAndCol(screenRoomNew.NumberSeat)
        // insertSeatIntoScreen(row, column, data)
        // const deleteOldSeat = await Showtimes.deleteMany({
        //   _id: {
        //     $in: show.SeatId
        //   }
        // })
        await Promise.all([
          insertSeatIntoScreen(row, column, data),
          Seat.deleteMany({
            _id: {
              $in: show.SeatId
            }
          }),
          Showtimes.updateOne(
            {
              _id: id
            },
            {
              $pull: {
                SeatId: {
                  $in: show.SeatId
                }
              }
            }
          )
        ])
        const result = await Promise.all(promises).catch((error) => {
          throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
        })
        // Update lịch chiếu phim

        if (!result || result.length === 0) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Cập nhật khung thời gian hoặc lịch chiếu không thành công'
          )
        }
        return
      }

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
    }
    const result = await Promise.all(promises).catch((error) => {
      throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
    })
    // Update lịch chiếu phim

    if (!result || result.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cập nhật khung thời gian hoặc lịch chiếu không thành công'
      )
    }

    return result
  } catch (error) {
    throw error
  }
}
export const updateMovieShowService = async (req) => {
  try {
    const { id } = req.params
    const body = req.body
    const currentShow = await Showtimes.findById(id).populate('screenRoomId')
    const swapShow = await Showtimes.findById(body._id).populate('screenRoomId')
    if (!currentShow || !swapShow) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Không tìm thấy lịch chiếu hợp lệ'
      )
    }
    await Promise.all([
      Showtimes.updateOne(
        {
          _id: id
        },
        {
          $set: {
            movieId: body.movieId
          }
        }
      ),
      Showtimes.updateOne(
        {
          _id: body._id
        },
        {
          $set: {
            movieId: currentShow.movieId
          }
        }
      ),
      Movie.updateOne(
        {
          _id: currentShow.movieId
        },
        {
          $pull: {
            showTimes: id
          }
        }
      ),
      Movie.updateOne(
        {
          _id: currentShow.movieId
        },
        {
          $addToSet: {
            showTimes: body._id
          }
        }
      ),
      Movie.updateOne(
        {
          _id: swapShow.movieId
        },
        {
          $pull: {
            showTimes: body._id
          }
        }
      ),
      Movie.updateOne(
        {
          _id: swapShow.movieId
        },
        {
          $addToSet: {
            showTimes: id
          }
        }
      )
    ])

    return body
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
export const updateApproval = async (id) => {
  try {
    const updateShowTime = await Showtimes.updateOne(
      { _id: id },
      {
        $set: {
          status: AVAILABLE_SCHEDULE
        }
      },
      {
        new: true
      }
    )
    if (!updateShowTime || Object.keys(updateShowTime).length == 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cập nhật thất bại')
    }
    const currentShow = await Showtimes.findById(id)
    await Movie.findByIdAndUpdate(
      currentShow.movieId,
      {
        $set: {
          status: IS_SHOWING
        }
      },
      { new: true }
    )
    return updateShowTime
  } catch (error) {
    throw error
  }
}
