/* eslint-disable no-useless-catch */
import Ticket, { CANCELLED, PAID } from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import Seat, { AVAILABLE } from '../../model/Seat'
import Food from '../../model/Food'

export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Ticket theo ID trước khi cập nhật
    const ticket = await Ticket.findById(id)

    // Kiểm tra nếu thức ăn không tồn tại hoặc đã được đánh dấu xóa
    if (!ticket) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Ticket not found')
    }
    if (ticket.isDeleted) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Ticket already deleted!')
    }
    if (ticket.status !== CANCELLED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Ticket cannot be deleted unless it is cancelled!'
      )
    }

    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    const data = await Ticket.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    )
    return data
  } catch (error) {
    throw error
  }
}
export const removeHardService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Ticket theo ID trước khi cập nhật
    const ticket = await Ticket.findById(id)

    // Kiểm tra nếu thức ăn không tồn tại hoặc đã được đánh dấu xóa
    if (!ticket) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Ticket not found')
    }
    // if (ticket.status === PAID) {
    //   throw new ApiError(
    //     StatusCodes.BAD_REQUEST,
    //     'Ticket is sold. Cannot delete it'
    //   )
    // }

    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    const data = await Ticket.findByIdAndDelete(id)
    const seatIds = data.seatId.map((seat) => seat._id)
    await Promise.all([
      Seat.updateMany(
        {
          _id: {
            $in: seatIds
          }
        },
        {
          $set: {
            status: AVAILABLE
          }
        }
      ),
      Food.updateMany(
        {
          _id: {
            $in: ticket.foods.map((food) => food.foodId)
          }
        },
        {
          $pull: {
            ticketId: id
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
