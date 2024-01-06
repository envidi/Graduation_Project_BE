/* eslint-disable no-useless-catch */
import Seat, {
  SOLD
} from '../../model/Seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'


export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id

    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Seat id is not found!')
    }
    const oldSeat = await Seat.findById(id)
    if (oldSeat.status === SOLD) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This seat is sold. Can not delete it!'
      )
    }
    const data = await Seat.deleteOne({ _id: id })
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete seat failed!')
    }
    return data
  } catch (error) {
    throw error
  }
}
