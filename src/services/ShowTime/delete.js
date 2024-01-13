/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import Seat from '../../model/Seat.js'
import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import { SOLD, UNAVAILABLE, AVAILABLE } from '../../model/Seat.js'
import TimeSlot from '../../model/TimeSlot.js'
import Showtimes from '../../model/Showtimes.js'
import { timeSlotService } from '../TimeSlot/index.js'
import Movie from '../../model/Movie.js'

export const removeService = async (req) => {
  try {
    const { id } = req.params

    // check xem có ai đặt ghê chưa
    const response = await Showtimes.findById(id)
    if (!response) {
      throw new ApiError(StatusCodes.NOT_FOUND, ' Show not found!')
    }

    const timeSlot = await timeSlotService.getTimeSlotIdWithScreenRoomId({
      showTimeId: response._id,
      screenRoomId: response.screenRoomId
    })

    if (!timeSlot && Object.keys(timeSlot).length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'This showtime dont have a timeslot in this room'
      )
    }

    const result = await Promise.all([
      timeSlotService.removeService(timeSlot._id),
      Showtimes.deleteOne({ _id: id }),
      Movie.updateOne(
        {
          _id: response.movieId
        },
        {
          $pull: {
            showTimes: response._id
          }
        }
      )
    ])
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot delete timeslot or delete showtime'
      )
    }

    return response
  } catch (error) {
    throw error
  }
}

export const deleteSoftService = async (req) => {
  try {
    const id = req.params.id
    // const body = reqBody.body
    const checkScreenRoom = await Showtimes.paginate(
      { _id: id },
      {
        populate: {
          path: 'TimeSlotId',
          populate: {
            path: 'SeatId'
          }
        }
      }
    )
    const timeSlotIds = await ScreeningRoom.paginate(
      {
        _id: id
      },
      {
        populate: {
          path: 'TimeSlotId',
          select: '_id SeatId'
        }
      }
    )
    // Tìm kiếm trong tất cả timeslot xem có ghế nào ở trạng thái được bán không
    // Nếu có thì không cho xóa
    const timeSlots = checkScreenRoom.docs[0].TimeSlotId
    timeSlots.forEach((timeSlot) => {
      const isSeatSold = timeSlot.SeatId.some((seat) => seat.status === SOLD)
      if (isSeatSold) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Some seat in this screen is already sold'
        )
      }
    })
    // Cập nhật screen room thành đã bị xóa mềm
    const data = await ScreeningRoom.findByIdAndUpdate(
      { _id: id },
      {
        destroy: true
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
    if (
      timeSlotIds.docs[0].TimeSlotId &&
      timeSlotIds.docs[0].TimeSlotId.length > 0
    ) {
      promises.push(
        TimeSlot.updateMany(
          {
            _id: {
              $in: timeSlotIds.docs[0].TimeSlotId
            }
          },
          {
            destroy: true
          }
        )
      )
    }
    // Cập nhật tất cả ghế trong tất cả timeslot
    // trong screen thành trạng thái unavailable
    timeSlotIds.docs[0].TimeSlotId.forEach((timeSlot) => {
      promises.push(
        Seat.updateMany(
          {
            _id: {
              $in: timeSlot.SeatId
            }
          },
          {
            status: UNAVAILABLE
          }
        )
      )
    })

    const result = await Promise.all(promises)
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Update timeslot from rooms failed!'
      )
    }
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

// Ngược lại cái so với delete soft
export const restoreService = async (req) => {
  try {
    const id = req.params.id
    // const body = reqBody.body

    const timeSlotIds = await Showtimes.paginate(
      {
        _id: id
      },
      {
        populate: {
          path: 'TimeSlotId',
          select: '_id SeatId'
        }
      }
    )

    const data = await ScreeningRoom.findByIdAndUpdate(
      { _id: id },
      {
        destroy: false
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
    if (
      timeSlotIds.docs[0].TimeSlotId &&
      timeSlotIds.docs[0].TimeSlotId.length > 0
    ) {
      promises.push(
        TimeSlot.updateMany(
          {
            _id: {
              $in: timeSlotIds.docs[0].TimeSlotId
            }
          },
          {
            destroy: false
          }
        )
      )
    }

    timeSlotIds.docs[0].TimeSlotId.forEach((timeSlot) => {
      promises.push(
        Seat.updateMany(
          {
            _id: {
              $in: timeSlot.SeatId
            }
          },
          {
            status: AVAILABLE
          }
        )
      )
    })

    const result = await Promise.all(promises)
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Restore timeslot from rooms failed!'
      )
    }
    return data
  } catch (error) {
    throw error
  }
}
