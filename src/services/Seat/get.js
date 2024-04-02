/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'

import Seat from '../../model/Seat.js'
import ApiError from '../../utils/ApiError.js'
// Lấy
export const getAllService = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 50,
      _sort = 'createdAt',
      _order = 'asc',
      _hallId = '',
      _showId = ''
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'ScreeningRoomId',
        select: 'status'
      }
    }

    // Lấy ra cả dữ liệu của bảng screenroom
    const data = await Seat.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
// export const getAllServiceByShowTime = async (reqBody) => {
//   try {
//     const {
//       _page = 1,
//       _limit = 50,
//       _sort = 'createdAt',
//       _order = 'asc',
//       _hallId = '',
//       _showId = ''
//     } = reqBody.query
//     const options = {
//       page: _page,
//       limit: _limit,
//       sort: {
//         [_sort]: _order === 'asc' ? 1 : -1
//       },
//       populate: {
//         path: 'ScreeningRoomId',
//         select: 'status'
//       }
//     }

//     // Lấy ra cả dữ liệu của bảng screenroom
//     const data = await Seat.paginate(
//       {
//         ScreeningRoomId: _hallId,
//         ShowScheduleId: _showId
//       },
//       options
//     )
//     if (!data || data.docs.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found!')
//     }
//     return data
//   } catch (error) {
//     throw error
//   }
// }

// export const getAllServiceByShowTime = async (_screenRoomId, _ShowtimesId) => {
//   try {
//     const data = await Seat.find({
//       ScreeningRoomId: _screenRoomId,
//       ShowScheduleId: _ShowtimesId
//     }).populate('ScreeningRoomId').populate('ShowScheduleId');

//     if (!data || data.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found for the specified room and show time!');
//     }
//     console.log(data)
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const getAllServiceByShowTime = async (reqBody) => {
//   try {
//     const {
//       _page = 1,
//       _limit = 50,
//       _sort = 'createdAt',
//       _order = 'asc',
//       _hallId = '',
//       _showId = ''
//     } = reqBody.query
//     const query = {}
//     if (_hallId) query.ScreeningRoomId = _hallId;
//     if (_showId) query.ShowScheduleId = _showId;

//     const options = {
//       page: _page,
//       limit: _limit,
//       sort: {
//         [_sort]: _order === 'asc' ? 1 : -1
//       },
//       populate: {
//         path: 'ScreeningRoomId',
//         select: 'status'
//       }
//     }

//     // Lấy ra cả dữ liệu của bảng screenroom
//     const data = await Seat.paginate(query, options)
//     if (!data || data.docs.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found!')
//     }
//     return data
//   } catch (error) {
//     throw error
//   }
// }
export const getAllServiceByShowTime = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 50,
      _sort = 'createdAt',
      _order = 'asc',
      _hallId = '',
      _showId = ''
    } = reqBody.query;

    const query = {};
    if (_hallId) query.ScreeningRoomId = mongoose.Types.ObjectId(_hallId);
    if (_showId) query.ShowScheduleId = mongoose.Types.ObjectId(_showId);

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: [
        {
          path: 'ScreeningRoomId',
          select: 'name CinemaId' // Thay đổi 'status' thành 'name' hoặc thông tin bạn muốn hiển thị
        },
        {
          path: 'ShowScheduleId',
          select: 'timeFrom timeTo' // Thêm populate cho lịch chiếu để lấy thông tin lịch chiếu
        }
      ]
    };

    // Lấy ra dữ liệu ghế theo phòng chiếu và lịch chiếu
    const data = await Seat.paginate(query, options);
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found!');
    }
    return data;
  } catch (error) {
    throw error;
  }
};
export const getOneService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Seat.findById(id)
    // Lấy dữ liệu từ bảng screen khi query data từ bảng Seat
    const data = await Seat.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'screeningrooms',
          localField: 'ScreeningRoomId',
          foreignField: '_id',
          as: 'ScreenColumn'
        }
      },
      {
        $project: {
          ScreeningRoomId: 0
        }
      }
    ])
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No seat found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
