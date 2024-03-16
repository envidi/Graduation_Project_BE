/* eslint-disable no-useless-catch */
import Ticket, { PAID } from '../../model/Ticket'
import dayjs from '../../utils/timeLib.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import ticketValidateSchema from '../../validations/ticket.js'
import Seat, { AVAILABLE, RESERVED, SOLD } from '../../model/Seat'
import Showtimes, {
  AVAILABLE_SCHEDULE,
  FULL_SCHEDULE
} from '../../model/Showtimes'
import { seatService } from '../Seat/index.js'
import findDifferentElements from '../../utils/findDifferent.js'
import { IS_SHOWING } from '../../model/Movie.js'
import { scheduleService } from '../ShowTime/index.js'
import { paymentService } from '../Payment/index.js'

export const updateService = async (reqBody) => {
  try {
    const { id } = reqBody.params
    const updateData = reqBody.body // Dữ liệu cập nhật từ request body
    const { error } = ticketValidateSchema.validate(updateData, {
      abortEarly: false
    }) // Kiểm tra dữ liệu hợp lệ
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message) // Nếu lỗi, trả về lỗi BAD_REQUEST
    }
    // Kiểm tra xem Ghế có đang trống hay không

    const [ticket, seat] = await Promise.all([
      Ticket.findById(id),
      Seat.find({
        _id: {
          $in: updateData.seatId
        }
      })
    ])
    const newIds = seat.map((s) => s._id)

    seat.forEach((s) => {
      if (!s || ![AVAILABLE, RESERVED].includes(s.status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Ghế không khả dụng.')
      }
    })

    // Kiểm tra xem Lịch chiếu có sẵn hay không
    const showtime = await Showtimes.findById(updateData.showtimeId)
    if (!showtime || showtime.status !== AVAILABLE_SCHEDULE) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Lịch chiếu không khả dụng.')
    }

    const data = await Ticket.findOneAndUpdate(
      { _id: id, isDeleted: false }, // Tìm vé theo ID và chưa bị xóa
      { $set: updateData }, // Cập nhật dữ liệu
      { new: true } // Trả về vé sau khi đã cập nhật
    )
    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Ticket not found or has been deleted!'
      )
    }
    const differentElement = findDifferentElements(ticket.seatId, newIds)
    const newTicketSeat = differentElement.filter((pro) => {
      if (updateData.seatId.includes(pro)) {
        return pro
      }
    })
    const oldSeatStatus = findDifferentElements(newTicketSeat, differentElement)
    const promises = []
    if (newTicketSeat || newTicketSeat.length > 0) {
      newTicketSeat.forEach((element) => {
        const reqBody = {
          body: {
            status: RESERVED
          },
          params: {
            id: element
          }
        }
        promises.push(seatService.updateStatusService(reqBody))
      })
    }
    if (oldSeatStatus || oldSeatStatus.length > 0) {
      oldSeatStatus.forEach((element) => {
        const reqBody = {
          body: {
            status: AVAILABLE
          },
          params: {
            id: element
          }
        }
        promises.push(seatService.updateStatusService(reqBody))
      })
    }
    await Promise.all(promises).catch((err) => {
      throw new ApiError(StatusCodes.BAD_REQUEST, err.message)
    })
    return data
  } catch (error) {
    throw error
  }
}

export const updatePaymentTicketService = async (reqBody) => {
  try {
    const { id } = reqBody.params
    const updateData = reqBody.body // Dữ liệu cập nhật từ request body
    const { error } = ticketValidateSchema.validate(updateData, {
      abortEarly: false
    }) // Kiểm tra dữ liệu hợp lệ
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message) // Nếu lỗi, trả về lỗi BAD_REQUEST
    }
    const dataShowTime = await Showtimes.findOne(
      { _id: updateData.showtimeId },
      'timeFrom timeTo'
    ).populate('movieId', 'status')

    if (dataShowTime.movieId.status !== IS_SHOWING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The movie is not released. Cannot order the seat'
      )
    }
    const now = dayjs()
    if (now > dataShowTime.timeFrom) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The seat reservation time has expired'
      )
    }
    // Kiểm tra xem Ghế có đang trống hay không
    const seat = await Seat.find({
      _id: {
        $in: updateData.seatId
      }
    })
    seat.forEach((s) => {
      if (!s || ![AVAILABLE, RESERVED].includes(s.status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Ghế không khả dụng.')
      }
    })

    // Kiểm tra xem Lịch chiếu có sẵn hay không
    const showtime = await Showtimes.findById(updateData.showtimeId)
    if (!showtime || showtime.status !== AVAILABLE_SCHEDULE) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Lịch chiếu không khả dụng.')
    }
    const payment = await paymentService.createService({
      amount: updateData.amount,
      typePayment: updateData.typePayment,
      typeBank: updateData.typeBank,
      ticketId: id
    })

    const data = await Ticket.findOneAndUpdate(
      { _id: id, isDeleted: false }, // Tìm vé theo ID và chưa bị xóa
      { $set: { ...updateData, status: PAID, paymentId : payment._id } }, // Cập nhật dữ liệu
      { new: true } // Trả về vé sau khi đã cập nhật
    )
    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Ticket not found or has been deleted!'
      )
    }

    const promises = []

    updateData.seatId.forEach((element) => {
      promises.push(
        Seat.updateOne({ _id: element }, { $set: { status: SOLD } })
      )
    })

    await Promise.all(promises).catch((err) => {
      throw new ApiError(StatusCodes.BAD_REQUEST, err.message)
    })
    const seatUpdated = await Seat.find({
      ShowScheduleId: updateData.showtimeId
    })

    const allSeatIsSold = seatUpdated.every((seat) => {
      return seat.status === SOLD
    })

    if (allSeatIsSold) {
      await Promise.all([
        scheduleService.updateStatusFull(dataShowTime._id.toString(), {
          status: FULL_SCHEDULE
        })
      ]).catch((error) => {
        throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
      })
    }

    return data
  } catch (error) {
    throw error
  }
}
