/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import ticketValidateSchema from '../../validations/Ticket'


export const createService = async (reqBody) => {
  try {
    const body = reqBody.body
    const { error } = ticketValidateSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // Tạo ticket mới với thông tin cần thiết
    const data = await Ticket.create({
      ...body

    });

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create ticket failed!')
    }
    return data
  } catch (error) {
    throw error
  }
}