/* eslint-disable no-useless-catch */
import Seat, {
  AVAILABLE,
  RESERVED,
  SOLD,
  UNAVAILABLE
} from '../../model/Seat.js'
import { AVAILABLE as AvailableRoomStatus } from '../../model/ScreenRoom.js'
import seatChema from '../../validations/seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import ScreenRoom, { FULL } from '../../model/ScreenRoom.js'
import { checkAndUpdateScreen } from '../../controllers/seat.js'

export const updateService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    const body = reqBody.body

    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Seat id not found')
    }
    const { error } = seatChema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }

    const data = await Seat.findById(id)
    const dataScreen = await ScreenRoom.findById(
      data.ScreeningRoomId,
      'destroy status'
    )

    // Nếu như bảng screen room mà ghế đang tồn tại bên trong đó đã bị xóa mềm
    // và ghế đang muốn sửa có trạng thái là unavailable thì không thể cập nhật
    if (dataScreen.destroy === true && data.status === UNAVAILABLE) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This seat is unavailable to edit'
      )
    }

    const updateData = await Seat.updateOne(
      { _id: id },
      { $set: { status: body.status } }
    )

    const isScreenFull = dataScreen.status === FULL
    const isBodyStatusValid = [AVAILABLE, RESERVED].includes(body.status)
    // Nếu như tất cả ghế có trạng thái là SOLD thì phòng chiếu tất cả
    // ghế đó sẽ chuyển thành trạng thái là full
    const allSeat = await Seat.find({}, 'status')
    if (body.status === SOLD) {
      const allSeatIsSold = allSeat.every((seat) => seat.status === SOLD)
      if (allSeatIsSold) {
        await checkAndUpdateScreen(data.ScreeningRoomId, FULL)
      }
    }
    // Nếu như screen của ghế đang được sửa có trạng thái là full
    // và ghế đang được sửa thành có trạng thái available và reserved
    // thì chuyển trạng thái screen sang available


    if (isScreenFull) {
      if (isBodyStatusValid) {
        await checkAndUpdateScreen(data.ScreeningRoomId, AvailableRoomStatus)
      }
    }

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update seat failed!')
    }
    return updateData
  } catch (error) {
    throw error
  }
}
