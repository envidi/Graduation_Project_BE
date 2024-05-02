/* eslint-disable no-useless-catch */
import Seat, { NORMAL, VIP } from '../../model/Seat.js'
import seatChema from '../../validations/seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import ScreenRoom from '../../model/ScreenRoom.js'
import { seatService } from './index.js'
import Showtimes from '../../model/Showtimes.js'

export const insertSeatIntoScreen = async (rowCount, columnCount, data) => {
  for (let row = 1; row <= rowCount; row++) {
    for (let column = 1; column <= columnCount; column++) {
      let seatTypeToUse = VIP
      let priceSeat = 70000
      // Check if the seat is in the middle (assuming rowCount and columnCount are odd)
      if (
        row === 1 ||
        row === rowCount ||
        column === 1 ||
        column === columnCount - 1 ||
        column === 2 ||
        column === columnCount
      ) {
        seatTypeToUse = NORMAL
        priceSeat = 50000
      }

      // Add the new seat with seat type
      const req = {
        body: {
          ShowScheduleId: data._id.toString(),
          ScreeningRoomId: data.screenRoomId.toString(),
          row,
          column,
          typeSeat: seatTypeToUse,
          price: priceSeat
        }
      }

      const dataSeat = await seatService.createService(req)

      await Showtimes.findByIdAndUpdate(
        data._id,
        {
          $addToSet: { SeatId: dataSeat._id }
        },
        { new: true }
      )
    }
  }
  // await Promise.all(promises)
}

export const createService = async (reqBody) => {
  try {
    const body = reqBody.body
    const ScreenId = body.ScreeningRoomId
    const isScreenRoomExist = await ScreenRoom.findById(ScreenId)
    if (!isScreenRoomExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Screen room id is not found')
    }
    const { error } = seatChema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // Tìm xem dữ liệu của ghế đã có trong database tại một rạp đã có chưa
    // Nếu chưa thì thêm vào , nếu có rồi thì báo lỗi , nếu như khác rạp phim thì vẫn thêm được
    // const isExistSeat = await Seat.find({
    //   $and: [
    //     {
    //       row: body.row
    //     },
    //     {
    //       column: body.column
    //     },
    //     {
    //       ScreeningRoomId: body.ScreeningRoomId
    //     }
    //   ]
    // })
    // if (isExistSeat || isExistSeat.length > 0) {
    //   throw new ApiError(StatusCodes.CONFLICT, 'Seat is already in use')
    // }

    const data = await Seat.create({
      ...body
    })

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create seat failed!')
    }

    // const updateScreenHaveSeatId = await ScreenRoom.findByIdAndUpdate(
    //   ScreenId,
    //   {
    //     $addToSet: { SeatId: data._id }
    //   },
    //   { new: true }
    // )
    // if (!updateScreenHaveSeatId) {
    //   throw new ApiError(
    //     StatusCodes.BAD_REQUEST,
    //     'Update screen room have seat failed!'
    //   )
    // }
    return data
  } catch (error) {
    throw error
  }
}
