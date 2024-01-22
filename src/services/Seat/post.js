/* eslint-disable no-useless-catch */
import Seat from '../../model/Seat.js'
import seatChema from '../../validations/seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import ScreenRoom from '../../model/ScreenRoom.js'

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
    const isExistSeat = await Seat.find({
      $and: [
        {
          row: body.row
        },
        {
          column: body.column
        },
        {
          ScreeningRoomId: body.ScreeningRoomId
        }
      ]
    })
    if (isExistSeat || isExistSeat.length > 0) {
      throw new ApiError(StatusCodes.CONFLICT, 'Seat is already in use')
    }

    const data = await Seat.create({
      ...body
    })

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create seat failed!')
    }

    const updateScreenHaveSeatId = await ScreenRoom.findByIdAndUpdate(
      ScreenId,
      {
        $addToSet: { SeatId: data._id }
      },
      { new: true }
    )
    if (!updateScreenHaveSeatId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Update screen room have seat failed!'
      )
    }
    return data
  } catch (error) {
    throw error
  }
}
