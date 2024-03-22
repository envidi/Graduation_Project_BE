/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import dayjs from '../../utils/timeLib.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import ticketValidateSchema from '../../validations/ticket.js'
import { AVAILABLE_SCHEDULE } from '../../model/Showtimes'
import { AVAILABLE_SCREEN } from '../../model/ScreenRoom'
import { AVAILABLE, RESERVED } from '../../model/Seat'
import Seat from '../../model/Seat'
import Showtimes from '../../model/Showtimes'
import ScreenRoom from '../../model/ScreenRoom'
import MoviePrice from '../../model/MoviePrice.js'
import Food from '../../model/Food.js'

export const createService = async (reqBody) => {
  try {
    const body = reqBody.body
    const { error } = ticketValidateSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // console.log(body)

    // Check if Seat is AVAILABLE
    const promises = [
      Showtimes.findOne({ _id: body.showtimeId }, 'timeFrom timeTo').populate(
        'movieId',
        'status'
      ),
      Seat.find({
        _id: { $in: body.seatId }
      }),
      MoviePrice.findOne({ _id: body.priceId })
    ]

    if (body.foods.length > 0) {
      promises.push(
        Food.find({
          _id: {
            $in: body.foods.map((food) => food.foodId)
          }
        })
      )
    }
    const [dataShowTime, seats, priceMovie, foods] = await Promise.all(promises)
    const now = dayjs()
    if (now > dataShowTime.timeFrom) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The seat reservation time has expired'
      )
    }

    const result = seats.some((seat_availble) => {
      return seat_availble.status !== AVAILABLE
    })

    if (result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Seat is not available.')
    }
    const totalSeatPrice = seats.reduce((accu, seat) => {
      return (accu += seat.price)
    }, 0)
    const totalFoodPrice =
      foods && foods.length > 0
        ? foods.reduce((accu, food) => {
            return (accu += food.price)
          }, 0)
        : 0
    // const totalFoodPrice = 0
    const totalPriceMovie = priceMovie.price

    // Check if Showtimes is AVAILABLE_SCHEDULE
    const showtime = await Showtimes.findById(body.showtimeId)
    if (!showtime || showtime.status !== AVAILABLE_SCHEDULE) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Showtimes schedule is not available.'
      )
    }

    // Check if ScreenRoom is AVAILABLE_SCREEN
    const screenRoom = await ScreenRoom.findById(showtime.screenRoomId) // Assuming the showtime has a reference to the screen room
    if (!screenRoom || screenRoom.status !== AVAILABLE_SCREEN) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Screen Room is not available.'
      )
    }
    const total = totalPriceMovie + totalSeatPrice + totalFoodPrice
    const data = await Ticket.create({
      ...body,
      quantity: body.seatId.length,
      totalPrice: total
    })
    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create ticket failed!')
    }
    await Promise.all([
      Seat.updateMany(
        {
          _id: {
            $in: body.seatId
          }
        },
        {
          $set: {
            status: RESERVED
          }
        }
      ),
      Food.updateMany(
        {
          _id: {
            $in: body.foods.map((food) => food.foodId)
          }
        },
        {
          $addToSet: {
            ticketId: data._id
          }
        }
      )
    ]).catch((err) => {
      throw new ApiError(StatusCodes.CONFLICT, new Error(err.message))
    })

    return data
  } catch (error) {
    throw error
  }
}
