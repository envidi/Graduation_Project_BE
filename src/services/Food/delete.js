/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import Food from '../../model/Food.js'

export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Food theo ID trước khi cập nhật
    const food = await Food.findById(id);

    // Kiểm tra nếu thức ăn không tồn tại hoặc đã được đánh dấu xóa
    if (!food || food.isDeleted) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Food not found or already deleted!');
    }

    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    const data = await Food.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return data;
  } catch (error) {
    throw error;
  }
}

