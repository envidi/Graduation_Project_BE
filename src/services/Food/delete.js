/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import Food from '../../model/Food.js'

export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Food theo ID trước khi cập nhật
    const food = await Food.findById(id)

    // Kiểm tra nếu thức ăn không tồn tại hoặc đã được đánh dấu xóa
    if (!food || food.isDeleted) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Food not found or already deleted!'
      )
    }
    if (food.ticketId.length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This food has already sold. Cannot delete it'
      )
    }

    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    const data = await Food.findByIdAndUpdate(
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
    // Tìm đối tượng Food theo ID trước khi cập nhật
    const food = await Food.findById(id)

    // Kiểm tra nếu thức ăn không tồn tại hoặc đã được đánh dấu xóa
    if (!food || Object.keys(food).length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Food not found or already deleted!'
      )
    }
    if (food.ticketId.length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This food has already sold. Cannot delete it'
      )
    }

    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    const data = await Food.findByIdAndDelete(id)
    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Delete food failed')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const removeAdminHardService = async (reqBody) => {
  try {
    const id = reqBody.params.id;
    const food = await Food.findById(id);

    if (!food) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Food not found!');
    }

    if (food.ticketId.length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This food has already sold. Cannot delete it'
      );
    }

    // Xóa cứng đối tượng Food
    const data = await Food.findByIdAndDelete(id);
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Delete food failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}