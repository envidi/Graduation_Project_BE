/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import WatchList from '../../model/WatchList'
import ApiError from '../../utils/ApiError'
export const removeHardService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Ticket theo ID trước khi cập nhật
    const watchlist = await WatchList.findByIdAndDelete(id)

    // Kiểm tra nếu thức ăn không tồn tại hoặc đã được đánh dấu xóa
    if (!watchlist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Watchlist not found')
    }

    return watchlist
  } catch (error) {
    throw error
  }
}
