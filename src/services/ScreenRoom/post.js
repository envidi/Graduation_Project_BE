/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { findSingleDocument } from './index.js'

import Seat from '../../model/Seat.js'
import { VIP, NORMAL } from '../../model/Seat.js'
import ScreeningRoomSchema from '../../validations/screenRoom.js'
import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import { slugify } from '../../utils/stringToSlug.js'
import Cinema from '../../model/Cinema.js'

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
        ScreeningRoomId: data._id,
        row,
        column,
        typeSeat: seatTypeToUse,
        price: priceSeat
      })
      await ScreeningRoom.findByIdAndUpdate(
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

    const { error } = ScreeningRoomSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await ScreeningRoom.create({
      ...body,
      slug: slugify(body.name)
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Create screening rooms failed!'
      )
    }
    const updateCinema = await Cinema.findByIdAndUpdate(
      {
        _id: body.CinemaId
      },
      {
        $addToSet: {
          ScreeningRoomId: data._id
        }
      }
    )
    if (!updateCinema) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Update cinema failed')
    }

    return await findSingleDocument(data._id)
  } catch (error) {
    throw error
  }
}

export const createForPostManService = async (reqBody) => {
  try {
    const body = reqBody.body

    const isExistSeat = await Seat.find({
      _id: {
        $in: body.SeatId
      }
    })
    const hasScreenRoom = isExistSeat.filter((seat) => {
      return seat.ScreeningRoomId == undefined
    })
    if (!isExistSeat || isExistSeat.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Seat id is not found')
    }
    if (hasScreenRoom.length == 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Seat is in different screen room'
      )
    }

    const { error } = ScreeningRoomSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await ScreeningRoom.create({
      ...body,
      slug: slugify(body.name)
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Create screening rooms failed!'
      )
    }
    const arraySeat = data.SeatId
    // Tạo vòng lặp để thêm từng cái product id vào mỗi mảng product của category
    for (let i = 0; i < arraySeat.length; i++) {
      await Seat.findOneAndUpdate(arraySeat[i], {
        $set: {
          ScreeningRoomId: data._id
        }
      })
    }

    return data
  } catch (error) {
    throw error
  }
}
