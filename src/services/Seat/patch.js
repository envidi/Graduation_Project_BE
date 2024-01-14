/* eslint-disable no-useless-catch */
import Seat, {
  AVAILABLE,
  RESERVED,
  SOLD,
  UNAVAILABLE
} from '../../model/Seat.js'
import { AVAILABLE as AvailableRoomStatus } from '../../model/TimeSlot.js'
import seatChema from '../../validations/seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { FULL } from '../../model/TimeSlot.js'
import { checkAndUpdateTimeSlot } from '../../controllers/seat.js'
import TimeSlot from '../../model/TimeSlot.js'
import Showtimes from '../../model/Showtimes.js'
import dayjs from '../../utils/timeLib.js'

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

    const resultTimeSlotAndSeat = await Promise.all([
      TimeSlot.findOne({ _id: body.TimeSlotId }).populate('SeatId'),
      Seat.findOne({ _id: id }),
      Showtimes.findOne({ _id: body.ShowScheduleId }, 'timeFrom timeTo')
    ])
    const [dataTimeSlot, dataSeat, dataShowTimes] = resultTimeSlotAndSeat

    // Kiểm tra xem thời gian đặt ghế đã quá thời gian chiếu phim chưa
    const now = dayjs()
    if (now > dataShowTimes.timeFrom) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The seat reservation time has expired'
      )
    }
    // Nếu như bảng timeslot mà ghế đang tồn tại bên trong đó đã bị xóa mềm
    // và ghế đang muốn sửa có trạng thái là unavailable thì không thể cập nhật
    if (dataTimeSlot.destroy || dataSeat.status === UNAVAILABLE) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This seat is unavailable to edit'
      )
    }

    const updateData = await Seat.updateOne(
      { _id: id },
      { $set: { status: body.status } }
    )

    const isTimeSlotFull = dataTimeSlot.status === FULL
    const isBodyStatusValid = [AVAILABLE, RESERVED].includes(body.status)
    // Nếu như tất cả ghế có trạng thái là SOLD thì timeslot tất cả
    // ghế đó sẽ chuyển thành trạng thái là full
    if (body.status === SOLD) {
      const allSeatIsSold = dataTimeSlot.SeatId.every(
        (seat) => seat.status === SOLD
      )
      if (allSeatIsSold) {
        await checkAndUpdateTimeSlot(dataTimeSlot._id, FULL)
      }
    }
    // Nếu như timeslot của ghế đang được sửa có trạng thái là full
    // và ghế đang được sửa thành có trạng thái available và reserved
    // thì chuyển trạng thái screen sang available

    if (isTimeSlotFull) {
      if (isBodyStatusValid) {
        await checkAndUpdateTimeSlot(dataTimeSlot._id, AvailableRoomStatus)
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
