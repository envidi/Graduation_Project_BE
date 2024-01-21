/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import Seat from '../../model/Seat.js'
import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import { SOLD, UNAVAILABLE, AVAILABLE } from '../../model/Seat.js'
import TimeSlot from '../../model/TimeSlot.js'
import Cinema from '../../model/Cinema.js'
import { scheduleService } from '../ShowTime/index.js'

export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await ScreeningRoom.findOneAndDelete({ _id: id })
    const data = await ScreeningRoom.paginate(
      { _id: id },
      {
        populate: {
          path: 'TimeSlotId',
          populate: 'SeatId'
        }
      }
    )
    const timeSlots = data.docs[0].TimeSlotId
    // Kiểm tra xem tất cả ghế trong khung giờ có trạng thái là sold không
    // Nếu có thì không cho xóa
    timeSlots.forEach((timeSlots) => {
      const isSeatSold = timeSlots.SeatId.some((seat) => seat.status === SOLD)
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
    if (timeSlots.length > 0) {
      timeSlots.forEach((timeslot) => {
        const req = {
          params : {
            id : timeslot._id.toString()
          }
        }
        promises.push(scheduleService.removeService(req))
      })
    }

    const result = await Promise.all(promises)

    if (!result || result.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete screening rooms failed!'
      )
    }

    return result
  } catch (error) {
    throw error
  }
}

export const deleteSoftService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const body = reqBody.body
    const checkScreenRoom = await ScreeningRoom.paginate(
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
export const restoreService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const body = reqBody.body

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
