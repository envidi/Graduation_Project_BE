/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ScreenRoom from '../../model/ScreenRoom.js'
import TimeSlotSchema from '../../validations/timeSlot.js'
import TimeSlot from '../../model/TimeSlot.js'
import ApiError from '../../utils/ApiError.js'
import Seat, { SOLD } from '../../model/Seat.js'

export const updateService = async (reqBody) => {
  // "ScreenRoomId": "659a4e2c7c13f6f0eb258ba2",
  // "Show_scheduleId": "658d7cf793752940d16b469e",
  // "status": "Available",
  // "destroy": false
  try {
    const body = reqBody.body
    const id = reqBody.params.id

    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Timeslot id not found')
    }
    const { error } = TimeSlotSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // const data = await ScreeningRoom.findByIdAndUpdate(id, body, { new: true })
    const currentTimeSlot = await TimeSlot.findById(id).populate('SeatId')

    // // Kiểm tra xem timeslot hiện tại có ghế nào ở trạng thái đã bán chưa
    const currentTimeSlotSeats = currentTimeSlot.SeatId.some(
      (seat) => seat.status === SOLD
    )
    if (currentTimeSlotSeats) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Some seat in this timeslot is sold. Can not edit it!'
      )
    }
    // Lấy ra screen cũ
    const screenRoomOld = await ScreenRoom.findById(
      currentTimeSlot.ScreenRoomId
    )
    // Lấy ra screen mới
    const screenRoomNew = await ScreenRoom.findById(body.ScreenRoomId)

    // Cập nhật screen mới , thêm timeslot hiện tại vào screen mới
    // Cập nhật screen cũ , xóa timeslot hiện tại khỏi screen cũ
    // Đặt lại screen id trong tất cả ghế của timeslot hiện tại
    let promises = [
      ScreenRoom.updateOne(
        { _id: screenRoomNew._id },
        {
          $addToSet: {
            TimeSlotId: currentTimeSlot._id
          }
        }
      ),
      ScreenRoom.updateOne(
        { _id: screenRoomOld._id },
        {
          $pull: {
            TimeSlotId: currentTimeSlot._id
          }
        }
      ),
      Seat.updateMany(
        {
          _id: {
            $in: currentTimeSlot.SeatId
          }
        },
        {
          $set: {
            ScreeningRoomId: body.ScreenRoomId
          }
        }
      )
    ]
    // // Nếu như screen id mới không tồn tại trong database thì không cho phép sửa
    if (!screenRoomNew || Object.keys(screenRoomNew).length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'This new screen room is not exist in database'
      )
    }
    const updateData = await TimeSlot.updateOne({ _id: id }, body)

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update timeslot failed!')
    }

    const result = await Promise.all(promises).catch((err) => {
      throw new ApiError(StatusCodes.CONFLICT, new Error(err.message))
    })
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Request failed')
    }

    return result
  } catch (error) {
    throw error
  }
}

export const updateStatus = async (id, data) => {
  try {
    const updateStatusTimeSlot = await TimeSlot.findByIdAndUpdate(id, data, {
      new: true
    })
    return updateStatusTimeSlot
  } catch (error) {
    throw error
  }
}
export const checkSomeSeatSold = async (timeslotId) => {
  try {
    const currentTimeSlot =
      await TimeSlot.findById(timeslotId).populate('SeatId')

    // // Kiểm tra xem timeslot hiện tại có ghế nào ở trạng thái đã bán chưa
    const currentTimeSlotSeats = currentTimeSlot.SeatId.some(
      (seat) => seat.status === SOLD
    )
    return currentTimeSlotSeats
  } catch (error) {
    throw error
  }
}
