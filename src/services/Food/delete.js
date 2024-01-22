/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import Food from '../../model/Food.js'

export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Food.findByIdAndDelete(id)

    // Cập nhật trường isDeleted thành true thay vì xóa bản ghi
    const data = await Food.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Food not found or already deleted!')
    }
    return data
  } catch (error) {
    throw error
  }
}

