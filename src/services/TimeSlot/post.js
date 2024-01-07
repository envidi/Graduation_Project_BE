/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { findSingleDocument } from './index.js'

import Seat from '../../model/Seat.js'
import { VIP, NORMAL } from '../../model/Seat.js'
import timeSlotSchema from '../../validations/timeSlot.js'
import TimeSlot from '../../model/TimeSlot.js'
import ApiError from '../../utils/ApiError.js'
import ScreenRoom from '../../model/ScreenRoom.js'

export const insertSeatIntoScreen = async (rowCount, columnCount, data) => {
  for (let row = 1; row <= rowCount; row++) {
    for (let column = 1; column <= columnCount; column++) {
      let seatTypeToUse = VIP
      let priceSeat = 120
      // Check if the seat is in the middle (assuming rowCount and columnCount are odd)
      if (
        row === 1 ||
        row === rowCount ||
        column === 1 ||
        column === columnCount
      ) {
        seatTypeToUse = NORMAL
        priceSeat = 100
      }

      // Add the new seat with seat type
      const dataSeat = await Seat.create({
        ShowScheduleId : data.Show_scheduleId,
        ScreeningRoomId: data.ScreenRoomId,
        TimeSlotId : data._id,
        row,
        column,
        typeSeat: seatTypeToUse,
        price: priceSeat
      })

      await TimeSlot.findByIdAndUpdate(
        data._id,
        {
          $addToSet: { SeatId: dataSeat._id }
        },
        { new: true }
      )
    }
  }
}

export const createService = async (reqBody) => {
  try {
    const body = reqBody.body
    const rowCount = 2
    const columnCount = 2

    const { error } = timeSlotSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await TimeSlot.create({
      ...body
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Create timeslot failed!'
      )
    }
    // Thêm 25 ghế vào room hiện tại
    await Promise.all([
      insertSeatIntoScreen(rowCount, columnCount, data),
      ScreenRoom.updateOne({ _id : data.ScreenRoomId }, {
        $addToSet : {
          TimeSlotId : data._id
        }
      })
    ])


    return await findSingleDocument(data._id)
  } catch (error) {
    throw error
  }
}


