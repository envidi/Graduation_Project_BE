/* eslint-disable no-useless-catch */
import Seat, {
  AVAILABLE,
  RESERVED,
  SOLD,
  UNAVAILABLE
} from '../../model/Seat.js'
import { FULL_SCHEDULE, AVAILABLE_SCHEDULE } from '../../model/Showtimes.js'
import { AVAILABLE_TIMESLOT, FULL_TIMESLOT } from '../../model/TimeSlot.js'
import seatChema from '../../validations/seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { checkAndUpdateTimeSlot } from '../../controllers/seat.js'
import TimeSlot from '../../model/TimeSlot.js'
import Showtimes from '../../model/Showtimes.js'
import dayjs from '../../utils/timeLib.js'
import { scheduleService } from '../ShowTime/index.js'
import { IS_SHOWING } from '../../model/Movie.js'

export const updateService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    const body = reqBody.body

    // const { error } = seatChema.validate(body, { abortEarly: true })
    // if (error) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    // }

    const resultTimeSlotAndSeat = await Promise.all([
      TimeSlot.findOne({ _id: body.TimeSlotId }).populate('SeatId'),
      Seat.findOne({ _id: id }),
      Showtimes.findOne(
        { _id: body.ShowScheduleId },
        'timeFrom timeTo'
      ).populate('movieId', 'status')
    ])

    const [dataTimeSlot, dataSeat, dataShowTimes] = resultTimeSlotAndSeat
    if (!dataSeat || Object.keys(dataSeat).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Seat id is not found')
    }
    // Nếu như bộ phim chưa công chiếu thì không thể đặt ghế
    if (dataShowTimes.movieId.status !== IS_SHOWING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The movie is not released. Cannot order the seat'
      )
    }

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

    const isTimeSlotFull = dataTimeSlot.status === FULL_TIMESLOT
    const isBodyStatusValid = [AVAILABLE, RESERVED].includes(body.status)
    // Nếu như tất cả ghế có trạng thái là SOLD thì timeslot tất cả
    // ghế đó sẽ chuyển thành trạng thái là full
    if (body.status === SOLD) {
      const allSeatIsSold = dataTimeSlot.SeatId.every((seat) => {
        return seat._id.toString() === id || seat.status === SOLD
      })
      if (allSeatIsSold) {
        await Promise.all([
          checkAndUpdateTimeSlot(
            dataTimeSlot._id,
            FULL_TIMESLOT,
            dataTimeSlot.ScreenRoomId
          ),
          scheduleService.updateStatusFull(dataShowTimes._id.toString(), {
            status: FULL_SCHEDULE
          })
        ]).catch((error) => {
          throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
        })
      }
    }
    // Nếu như timeslot của ghế đang được sửa có trạng thái là full
    // và ghế đang được sửa thành có trạng thái available và reserved
    // thì chuyển trạng thái screen sang available

    if (isTimeSlotFull) {
      if (isBodyStatusValid) {
        await Promise.all([
          checkAndUpdateTimeSlot(
            dataTimeSlot._id,
            AVAILABLE_TIMESLOT,
            dataTimeSlot.ScreenRoomId
          ),
          scheduleService.updateStatusFull(dataShowTimes._id.toString(), {
            status: AVAILABLE_SCHEDULE
          })
        ]).catch((error) => {
          throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
        })
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
export const updateStatusService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    const body = reqBody.body

    // const { error } = seatChema.validate(body, { abortEarly: true })
    // if (error) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    // }
    const dataSeat = await Seat.findOne({ _id: id })

    const resultTimeSlotAndSeat = await Promise.all([
      TimeSlot.findOne({ _id: dataSeat?.TimeSlotId }).populate('SeatId'),

      Showtimes.findOne(
        { _id: dataSeat?.ShowScheduleId },
        'timeFrom timeTo'
      ).populate('movieId', 'status')
    ])

    const [dataTimeSlot, dataShowTimes] = resultTimeSlotAndSeat
    if (!dataSeat || Object.keys(dataSeat).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Seat id is not found')
    }
    // Nếu như bộ phim chưa công chiếu thì không thể đặt ghế
    if (dataShowTimes.movieId.status !== IS_SHOWING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The movie is not released. Cannot order the seat'
      )
    }

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

    const isTimeSlotFull = dataTimeSlot.status === FULL_TIMESLOT
    const isBodyStatusValid = [AVAILABLE, RESERVED].includes(body.status)
    // Nếu như tất cả ghế có trạng thái là SOLD thì timeslot tất cả
    // ghế đó sẽ chuyển thành trạng thái là full
    if (body.status === SOLD) {
      const allSeatIsSold = dataTimeSlot.SeatId.every((seat) => {
        return seat._id.toString() === id || seat.status === SOLD
      })
      if (allSeatIsSold) {
        await Promise.all([
          checkAndUpdateTimeSlot(
            dataTimeSlot._id,
            FULL_TIMESLOT,
            dataTimeSlot.ScreenRoomId
          ),
          scheduleService.updateStatusFull(dataShowTimes._id.toString(), {
            status: FULL_SCHEDULE
          })
        ]).catch((error) => {
          throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
        })
      }
    }
    // Nếu như timeslot của ghế đang được sửa có trạng thái là full
    // và ghế đang được sửa thành có trạng thái available và reserved
    // thì chuyển trạng thái screen sang available

    if (isTimeSlotFull) {
      if (isBodyStatusValid) {
        await Promise.all([
          checkAndUpdateTimeSlot(
            dataTimeSlot._id,
            AVAILABLE_TIMESLOT,
            dataTimeSlot.ScreenRoomId
          ),
          scheduleService.updateStatusFull(dataShowTimes._id.toString(), {
            status: AVAILABLE_SCHEDULE
          })
        ]).catch((error) => {
          throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
        })
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
