/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'

import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'

export const getAllService = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
      // populate: {
      //   path: 'TimeSlotId',
      //   populate: {
      //     path: 'SeatId',
      //     select: 'status'
      //   }
      // }
    }
    const data = await ScreeningRoom.paginate({ destroy: false }, options)

    // const timeSlotNotDeletedSoft = data.docs.map((screen) => {
    //   const arrayTimeSlotNotDeleted = screen.TimeSlotId.map((timeslot) => {
    //     if (timeslot.destroy === false) {
    //       return timeslot
    //     }
    //     return
    //   })
    //   screen.TimeSlotId = [...arrayTimeSlotNotDeleted]
    //   return screen
    // })
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const getOneService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await ScreeningRoom.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng ScreeningRoom
    const data = await ScreeningRoom.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'seats',
          localField: 'SeatId',
          foreignField: '_id',
          as: 'SeatColumn'
        }
      },
      {
        $project: {
          name: 1,
          status: 1,
          CinemaId: 1,
          show_scheduleId: 1,
          SeatColumn: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return data
  } catch (error) {
    throw error
  }
}

// export const getAllIncludeDestroyService = async (reqBody) => {
//   try {
//     const {
//       _page = 1,
//       _limit = 10,
//       _sort = 'createdAt',
//       _order = 'asc'
//     } = reqBody.query
//     const options = {
//       page: _page,
//       limit: _limit,
//       sort: {
//         [_sort]: _order === 'asc' ? 1 : -1
//       },
//       populate: {
//         path: 'ShowtimesId'
//       }
//     }
//     const data = await ScreeningRoom.paginate({}, options)
//     if (!data || data.docs.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
//     }
//     return data
//   } catch (error) {
//     throw error
//   }
// }

export const getAllIncludeDestroyService = async (req) => {
  try {
    // Điều chỉnh để nhận các tham số trực tiếp từ `req.query`
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      CinemaId // Thêm tham số này để lọc theo CinemaId
    } = req.query;

    // Tạo điều kiện truy vấn dựa trên CinemaId nếu nó được cung cấp
    const queryCondition = CinemaId ? { CinemaId } : {};

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'ShowtimesId' // Duy trì việc populate nếu bạn muốn lấy thông tin chi tiết của Showtimes liên quan
      }
    };

    // Sử dụng điều kiện truy vấn khi gọi phương thức paginate
    const data = await ScreeningRoom.paginate(queryCondition, options);
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!');
    }
    return data;
  } catch (error) {
    throw error;
  }
};


export const getDetailRoomByShowTime = async (reqBody) => {
  try {
    const {
      _showId = ''
    } = reqBody.query

    const query = {}
    if (_showId) query.ShowtimesId = _showId;

    const options = {
      populate: {
        path: 'ShowtimesId',
        select: 'timeFrom timeTo movieId' // Thêm populate cho lịch chiếu để lấy thông tin lịch chiếu
      }
    }

    //lấy ra dữ liệu phòng theo lịch chiếu
    const data = await ScreeningRoom.paginate(query, options)
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không có dữ liệu phòng cho lịch chiếu này!');
    }
    return data;
  } catch (error) {
    throw error
  }
}