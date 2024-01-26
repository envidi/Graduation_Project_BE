/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import ticketValidateSchema from '../../validations/Ticket'


export const updateService = async (reqBody) => {
    try {
        const { id } = reqBody.params; // Lấy ID từ parameters
        const updateData = reqBody.body; // Dữ liệu cập nhật từ request body
        const { error } = ticketValidateSchema.validate(updateData, { abortEarly: false }); // Kiểm tra dữ liệu hợp lệ
        if (error) {
            throw new ApiError(StatusCodes.BAD_REQUEST, error.message); // Nếu lỗi, trả về lỗi BAD_REQUEST
        }
        const data = await Ticket.findOneAndUpdate(
            { _id: id, isDeleted: false }, // Tìm vé theo ID và chưa bị xóa
            { $set: updateData }, // Cập nhật dữ liệu
            { new: true } // Trả về vé sau khi đã cập nhật
        );
        if (!data) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found or has been deleted!'); // Nếu không tìm thấy vé, trả về NOT_FOUND
        }
        return data
    } catch (error) {
        throw error;
    }
}