/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import Seat from '../../model/Seat.js'
import ScreeningRoom, { AVAILABLE_SCREEN, CANCELLED_SCREEN } from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import { SOLD, UNAVAILABLE, AVAILABLE } from '../../model/Seat.js'
import TimeSlot from '../../model/TimeSlot.js'
import Cinema from '../../model/Cinema.js'
import Showtimes from '../../model/Showtimes.js'
import { scheduleService } from '../ShowTime/index.js'

export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await ScreeningRoom.findOneAndDelete({ _id: id })
    const data = await ScreeningRoom.paginate(
      { _id: id },
      {
        populate: {
          path: 'ShowtimesId',
          populate: 'SeatId'
        }
      }
    )
    const showTimes = data.docs[0].ShowtimesId
    // Kiểm tra xem tất cả ghế trong khung giờ có trạng thái là sold không
    // Nếu có thì không cho xóa
    showTimes.forEach((showTime) => {
      const isSeatSold = showTime.SeatId.some((seat) => seat.status === SOLD)
      if (isSeatSold) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Some seat is sold. Can not delete this screen'
        )
      }
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Cannot find screen with this id'
      )
    }
    // Kéo screenroom bị xóa ra khỏi mảng screen room id trong model cinema
    let promises = [
      ScreeningRoom.deleteOne({ _id: id }),
      Cinema.findByIdAndUpdate(
        {
          _id: data.docs[0].CinemaId
        },
        {
          $pull: {
            ScreeningRoomId: data.docs[0]._id
          }
        }
      )
    ]
    // Xóa hết các timeslot trong screen room
    if (showTimes.length > 0) {
      showTimes.forEach((timeslot) => {
        const req = {
          params: {
            id: timeslot._id.toString()
          }
        }

        promises.push(scheduleService.removeService(req))
      })
    }

    const result = await Promise.all(promises).catch((error) => {
      throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
    })

    return result
  } catch (error) {
    throw error
  }
}

export const deleteSoftService = async (reqBody) => {
  try {
    const id = reqBody.params.id

    const [checkScreenRoom] = await Promise.all([
      ScreeningRoom.paginate(
        { _id: id },
        {
          populate: {
            path: 'ShowtimesId',
            populate: {
              path: 'SeatId'
            }
          }
        }
      )
    ]).catch((error) => {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error.message))
    })
    // Tìm kiếm trong tất cả timeslot xem có ghế nào ở trạng thái được bán không
    // Nếu có thì không cho xóa
    const showTimeIds = checkScreenRoom.docs[0].ShowtimesId.map(
      (showTimeId) => {
        return showTimeId._id
      }
    )

    // Cập nhật screen room thành đã bị xóa mềm
    const data = await ScreeningRoom.findByIdAndUpdate(
      { _id: id },
      {
        destroy: true,
        status : CANCELLED_SCREEN
      },
      {
        new: true
      }
    )
    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete screening rooms failed!'
      )
    }
    let promises = []
    // Cập nhật tất cả timeslot trong screen thành đã bị xóa mềm
    if (showTimeIds || showTimeIds.length > 0) {
      promises.push(
        Showtimes.updateMany(
          {
            _id: {
              $in: showTimeIds
            }
          },
          {
            destroy: true
          }
        )
      )
    }

    await Promise.all(promises).catch((error) => {
      throw new Error(StatusCodes.CONFLICT, new Error(error.message))
    })

    return data
  } catch (error) {
    throw error
  }
}

// Ngược lại cái so với delete soft
export const restoreService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const body = reqBody.body

    const screenRoom = await ScreeningRoom.paginate(
      {
        _id: id
      },
      {
        populate: {
          path: 'ShowtimesId',
          select: '_id SeatId '
        }
      }
    )
    const showTimeIds = screenRoom.docs[0].ShowtimesId.map((showTimeId) => {
      return showTimeId._id
    })

    const data = await ScreeningRoom.findByIdAndUpdate(
      { _id: id },
      {
        destroy: false,
        status : AVAILABLE_SCREEN
      },
      {
        new: true
      }
    )
    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete screening rooms failed!'
      )
    }
    let promises = []
    if (showTimeIds && showTimeIds.length > 0) {
      promises.push(
        Showtimes.updateMany(
          {
            _id: {
              $in: showTimeIds
            }
          },
          {
            destroy: false
          }
        )
      )
    }

    await Promise.all(promises).catch((error) => {
      throw new Error(StatusCodes.CONFLICT, new Error(error.message))
    })
    return data
  } catch (error) {
    throw error
  }
}
