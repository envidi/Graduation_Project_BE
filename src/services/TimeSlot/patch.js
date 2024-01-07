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
    const seatIds = await TimeSlot.findById(id)

    const currentTimeSlotSeats = currentTimeSlot.SeatId.some(
      (seat) => seat.status === SOLD
    )
    if (currentTimeSlotSeats) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Some seat in this timeslot is sold. Can not edit it!'
      )
    }
    const screenRoomOld = await ScreenRoom.findById(
      currentTimeSlot.ScreenRoomId
    )

    const screenRoomNew = await ScreenRoom.findById(body.ScreenRoomId)
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
            $in: seatIds.SeatId
          }
        },
        {
          $set: {
            ScreeningRoomId: body.ScreenRoomId
          }
        }
      )
    ]
    if (!screenRoomNew && Object.keys(screenRoomNew).length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'This new screen room is not exist in database'
      )
    }
    const updateData = await TimeSlot.updateOne({ _id: id }, body)

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update timeslot failed!')
    }

    const result = await Promise.all(promises)
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Request failed')
    }

    return result
  } catch (error) {
    throw error
  }
}
