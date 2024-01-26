/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'

export const removeService = async (reqBody) => {
    try {
        const id = reqBody.params.id
        // Tìm đối tượng Ticket theo ID trước khi cập nhật
        const ticket = await Ticket.findById(id);

        // Kiểm tra nếu thức ăn không tồn tại hoặc đã được đánh dấu xóa
        if (!ticket || ticket.isDeleted) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Ticket not found or already deleted!');
        }

        // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
        const data = await Ticket.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return data;
    } catch (error) {
        throw error;
    }
}