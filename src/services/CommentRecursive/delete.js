/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import CommentRecursive from '../../model/commentRecursive.js'
export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Food theo ID trước khi cập nhật

    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    const data = await CommentRecursive.findByIdAndDelete(id)
    if (!data || Object.keys(data).length == 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Delete comment recursive failed'
      )
    }
    return data
  } catch (error) {
    throw error
  }
}
