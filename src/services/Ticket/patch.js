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
import { accessResultToken } from '../../middleware/jwt.js'
import { sendMailTicket } from '../../controllers/email.js'
import Food from '../../model/Food.js'

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

    const differentElement = findDifferentElements(
      ticket.seatId.map((seat) => seat._id),
      newIds
    )
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
        'Bộ phim chưa công chiếu. Không thể đặt ghế'
      )
    }
    const now = dayjs()
    if (now > dataShowTime.timeFrom) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Thời gian đặt ghế đã quá hạn'
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
        console.log(s)
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
      {
        $set: {
          ...updateData,
          status: PAID,
          paymentId: payment._id,
          totalPrice: updateData.amount
        }
      }, // Cập nhật dữ liệu
      { new: true } // Trả về vé sau khi đã cập nhật
    )
    const resultToken = accessResultToken(data._id, payment._id)
    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Ticket not found or has been deleted!'
      )
    }

    const promises = []
    const foodIds = updateData.foods.map((food) => food.foodId)
    if (foodIds || foodIds.length > 0) {
      promises.push(
        Food.updateMany(
          {
            _id: {
              $in: foodIds
            }
          },
          {
            $addToSet: {
              ticketId: id
            }
          }
        )
      )
    }

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
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'showtimeId paymentId screenRoomId movieId cinemaId userId',
        select:
          'CinemaName CinemaAdress price row column typeSeat name email timeFrom screenRoomId movieId typeBank typePayment name image categoryId'
      },
      select: {
        isDeleted: 0,
        updatedAt: 0
      }
    }

    const dataReturn = await Ticket.paginate(
      {
        _id: data._id
      },
      options
    )

    const {
      userId,
      seatId,
      movieId,
      cinemaId,
      screenRoomId,
      foods,
      showtimeId,
      quantity,
      totalPrice,
      paymentId
    } = dataReturn.docs[0]
    const req = {
      body: {
        _id: data._id,
        email: userId.email,
        seatId,
        date: data.createdAt,
        movieName: movieId.name,
        screenName: screenRoomId.name,
        typeBank: paymentId.typeBank,
        foods,
        showtimeTimeFrom: showtimeId.timeFrom,
        cinemaId,
        quantityTicket: quantity,
        totalPrice
      }
    }
    await sendMailTicket(req)
    return resultToken
  } catch (error) {
    throw error
  }
}
