/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import ticketValidateSchema from '../../validations/Ticket'
import Seat from '../../model/Seat'
import Showtimes from '../../model/Showtimes'
import ScreenRoom from '../../model/ScreenRoom'


export const updateService = async (reqBody) => {
  try {
    const { id } = reqBody.params;
    const updateData = reqBody.body; // Dữ liệu cập nhật từ request body
    const { error } = ticketValidateSchema.validate(updateData, { abortEarly: false }); // Kiểm tra dữ liệu hợp lệ
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message); // Nếu lỗi, trả về lỗi BAD_REQUEST
    }
    // Kiểm tra xem Ghế có đang trống hay không
    const seat = await Seat.findById(updateData.seatId);
    if (!seat || seat.status !== 'AVAILABLE') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Ghế không khả dụng.');
    }

    // Kiểm tra xem Lịch chiếu có sẵn hay không
    const showtime = await Showtimes.findById(updateData.showtimeId);
    if (!showtime || showtime.status !== 'AVAILABLE_SCHEDULE') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Lịch chiếu không khả dụng.');
    }

    // Kiểm tra xem Phòng chiếu có sẵn hay không
    const screenRoom = await ScreenRoom.findById(showtime.screenRoomId);
    if (!screenRoom || screenRoom.status !== 'AVAILABLE_SCREEN') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Phòng chiếu không khả dụng.');
    }

    const data = await Ticket.findOneAndUpdate(
      { _id: id, isDeleted: false }, // Tìm vé theo ID và chưa bị xóa
      { $set: updateData }, // Cập nhật dữ liệu
      { new: true } // Trả về vé sau khi đã cập nhật
    );
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found or has been deleted!');
    }
    return data
  } catch (error) {
    throw error;
  }
}