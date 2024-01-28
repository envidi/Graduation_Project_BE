/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import ticketValidateSchema from '../../validations/Ticket'
import { AVAILABLE_SCHEDULE } from '../../model/Showtimes'
import { AVAILABLE_SCREEN } from '../../model/ScreenRoom'
import { AVAILABLE } from '../../model/Seat'
import Seat from '../../model/Seat'
import Showtimes from '../../model/Showtimes'
import ScreenRoom from '../../model/ScreenRoom'

export const createService = async (reqBody) => {
  try {
    const body = reqBody.body
    const { error } = ticketValidateSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }

    // Check if Seat is AVAILABLE
    const seat = await Seat.find({
      _id: { $in: body.seatId }
    });
    console.log(seat)
    const result = seat.some((seat_availble) => { //some
      console.log(seat_availble.status)
      return seat_availble.status !== AVAILABLE
    })
    console.log(result)
    if (result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Seat is not available.');
    }

    // Check if Showtimes is AVAILABLE_SCHEDULE
    const showtime = await Showtimes.findById(body.showtimeId);
    if (!showtime || showtime.status !== AVAILABLE_SCHEDULE) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Showtimes schedule is not available.');
    }

    // Check if ScreenRoom is AVAILABLE_SCREEN
    const screenRoom = await ScreenRoom.findById(showtime.screenRoomId); // Assuming the showtime has a reference to the screen room
    if (!screenRoom || screenRoom.status !== AVAILABLE_SCREEN) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Screen Room is not available.');
    }


    const data = await Ticket.create({
      ...body,
      quantity: body.seatId.length

    });

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create ticket failed!')
    }
    return data
  } catch (error) {
    throw error
  }
}