/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import ScreeningRoomSchema from '../../validations/screenRoom.js'
import ScreeningRoom, {
  AVAILABLE_SCREEN,
  CANCELLED_SCREEN
} from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import { SOLD, UNAVAILABLE } from '../../model/Seat.js'
import Showtimes, {
  AVAILABLE_SCHEDULE,
  CANCELLED_SCHEDULE
} from '../../model/Showtimes.js'
import TimeSlot, {
  AVAILABLE_TIMESLOT,
  CANCELLED_TIMESLOT
} from '../../model/TimeSlot.js'

export const updateService = async (reqBody) => {
  try {
    const body = reqBody.body
    const id = reqBody.params.id
    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Screening rooms id not found')
    }
    const { error } = ScreeningRoomSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const allTimeSlots = await ScreeningRoom.paginate(
      { _id: id },
      {
        populate: {
          path: 'TimeSlotId',
          populate: {
            path: 'SeatId',
            select: 'status'
          }
        }
        ,
        populate: {
          path: 'CinemaId ShowtimesId',
          select: 'CinemaName CinemaAdress timeFrom timeTo' // Specify the fields you want to select
        }
      }
    )
    // Không thể chuyển phòng sang rạp chiếu khác
    // if (body.CinemaId.toString() !== allTimeSlots.docs[0].CinemaId.toString()) {
    //   throw new ApiError(
    //     StatusCodes.BAD_REQUEST,
    //     'Cannot change the cinema'
    //   )
    // }
    // Nếu như screen đã bị xóa mềm
    // thì không thể chỉnh sửa
    if (allTimeSlots.docs[0].destroy) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This room is deleted soft. Cannot edit it'
      )
    }
    // Kiểm tra xem tất cả ghế trong mỗi khung giờ đã được đặt chưa
    // allTimeSlots.docs[0].TimeSlotId.forEach((timeslot) => {
    //   const checkSeat = timeslot.SeatId.some(
    //     (seat) => seat.status === SOLD || seat.status === UNAVAILABLE
    //   )
    //   if (checkSeat) {
    //     throw new ApiError(
    //       StatusCodes.BAD_REQUEST,
    //       'Some seat in this room is sold or unavailable'
    //     )
    //   }
    // })
    const arrayShowtime = allTimeSlots.docs[0].TimeSlotId.map(
      (timeslot) => timeslot.Show_scheduleId
    )
    const updateScreen = await ScreeningRoom.findByIdAndUpdate(
      { _id: id },
      body,
      { new: true }
    )

    if (!updateScreen || Object.keys(updateScreen).length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Update screening rooms failed!'
      )
    }
    // Cập nhật tất cả lịch chiếu và khung giờ chiếu
    // trong phòng đó sang trạng thái hủy
    if (body.status === CANCELLED_SCREEN) {
      await Promise.all([
        Showtimes.updateMany(
          {
            _id: {
              $in: arrayShowtime
            }
          },
          {
            status: CANCELLED_SCHEDULE
          }
        ),
        TimeSlot.updateMany(
          {
            _id: {
              $in: allTimeSlots.docs[0].TimeSlotId
            }
          },
          {
            status: CANCELLED_TIMESLOT
          }
        )
      ]).catch((error) => {
        throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error.message))
      })
    }
    // Cập nhật tất cả lịch chiếu và khung giờ chiếu
    // trong phòng đó sang trạng thái trống
    if (body.status === AVAILABLE_SCREEN) {
      await Promise.all([
        Showtimes.updateMany(
          {
            _id: {
              $in: arrayShowtime
            }
          },
          {
            status: AVAILABLE_SCHEDULE
          }
        ),
        TimeSlot.updateMany(
          {
            _id: {
              $in: allTimeSlots.docs[0].TimeSlotId
            }
          },
          {
            status: AVAILABLE_TIMESLOT
          }
        )
      ]).catch((error) => {
        throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error.message))
      })
    }

    return updateScreen
  } catch (error) {
    throw error
  }
}

export const updateStatusScreen = async (screenId, statusScreen) => {
  try {
    const updateData = await ScreeningRoom.updateOne(
      { _id: screenId },
      statusScreen
    )

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Update screening rooms failed!'
      )
    }
    return updateData
  } catch (error) {
    throw error
  }
}
