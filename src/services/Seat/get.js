/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'

import Seat from '../../model/Seat.js'
import ApiError from '../../utils/ApiError.js'
import {
  convertTimeToCurrentZone,
  convertTimeToIsoString
} from '../../utils/timeLib.js'
// Lấy
// export const getAllService = async (reqBody) => {
//   try {
//     const {
//       _page = 1,
//       _limit = 100,
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
//       populate: [
//         {
//           path: 'ScreeningRoomId',
//           select: 'name' // Thay đổi 'status' thành 'name' hoặc thông tin bạn muốn hiển thị
//         },
//         {
//           path: 'ShowScheduleId',
//           select: 'timeFrom timeTo' // Thêm populate cho lịch chiếu để lấy thông tin lịch chiếu
//         }
//       ]
//     }
//     const query = { destroy: { $ne: true } };
//     if (_hallId) query.ScreeningRoomId = mongoose.Types.ObjectId(_hallId);
//     if (_showId) query.ShowScheduleId = mongoose.Types.ObjectId(_showId);

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

// export const getAllService = async (reqBody) => {
//   try {
//     const {
//       _page = 1,
//       _limit = 1000,
//       _sort = 'createdAt',
//       _order = 'asc',
//       _hallId = '',
//       _showId = ''
//     } = reqBody.query;

//     const options = {
//       page: _page,
//       limit: _limit,
//       sort: { [_sort]: _order === 'asc' ? 1 : -1 },
//       populate: [
//         {
//           path: 'ScreeningRoomId',
//           match: { destroy: false }, // Sử dụng match trong populate để chỉ lấy các phòng không bị destroy
//           select: 'name'
//         },
//         { path: 'ShowScheduleId', select: 'timeFrom timeTo' }
//       ]
//     };

//     const query = {};
//     if (_hallId) query.ScreeningRoomId = mongoose.Types.ObjectId(_hallId);
//     if (_showId) query.ShowScheduleId = mongoose.Types.ObjectId(_showId);

//     // Lấy dữ liệu và populate thông tin liên quan
//     const data = await Seat.paginate(query, options);

//     // Sau khi populate, cần lọc lại để loại bỏ các ghế mà không có thông tin phòng chiếu do điều kiện match
//     const seatsFromActiveRooms = data.docs.filter(docs => docs.ScreeningRoomId);

//     // Trả về dữ liệu sau khi đã lọc
//     return {
//       ...data,
//       docs: seatsFromActiveRooms // Sử dụng danh sách ghế đã được lọc
//     };
//   } catch (error) {
//     throw error;
//   }
// };

// Trong file get.js hoặc tương tự trên backend

export const getAllService = async (req) => {
  // Chắc chắn rằng bạn nhận đúng đối tượng request
  try {
    const { _page, _limit, _sort, _order, _hallId, _showId } = req.query
    // Logic để xây dựng điều kiện truy vấn dựa trên _hallId và _showId
    const query = {}
    if (_hallId) query.ScreeningRoomId = _hallId
    if (_showId) query.ShowScheduleId = _showId

    const options = {
      page: parseInt(_page) || 1,
      limit: parseInt(_limit) || 1000,
      sort: { [_sort || 'createdAt']: _order === 'asc' ? 1 : -1 },
      populate: [
        {
          path: 'ScreeningRoomId',
          match: { destroy: false },
          select: 'name'
        },
        {
          path: 'ShowScheduleId',
          select: 'timeFrom timeTo'
        }
      ]
    }

    const data = await Seat.paginate(query, options)
    // Đoạn mã này giả định rằng bạn có một hàm paginate tùy chỉnh đã xử lý các tham số trên
    // let convertShowTime = data[0].showTimeCol
    // convertShowTime = convertShowTime
    //   .map((showTime, index) => {
    //     if (showTime.destroy) return
    //     // showTime.timeFrom = convertTimeToCurrentZone(showTime.timeFrom)
    //     // showTime.timeTo = convertTimeToCurrentZone(showTime.timeTo)
    //     return {
    //       date: showTime.date,
    //       timeFrom: convertTimeToCurrentZone(showTime.timeFrom),
    //       timeTo: convertTimeToCurrentZone(showTime.timeTo),
    //       status: showTime.status
    //     }
    //   })
    //   .filter((showtime) => showtime != null)
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
      _limit = 60,
      _sort = 'createdAt',
      _order = 'asc',
      _hallId = '',
      _showId = ''
    } = reqBody.query

    const query = {}
    if (_hallId) query.ScreeningRoomId = mongoose.Types.ObjectId(_hallId)
    if (_showId) query.ShowScheduleId = mongoose.Types.ObjectId(_showId)

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: [
        {
          path: 'ScreeningRoomId',
          select: 'name' // Thay đổi 'status' thành 'name' hoặc thông tin bạn muốn hiển thị
        },
        {
          path: 'ShowScheduleId',
          select: 'timeFrom timeTo' // Thêm populate cho lịch chiếu để lấy thông tin lịch chiếu
        }
      ]
    }

    // Lấy ra dữ liệu ghế theo phòng chiếu và lịch chiếu
    const data = await Seat.paginate(query, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
export const getSeatByShowTime = async (reqBody) => {
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
    const data = await Seat.paginate(
      {
        ScreeningRoomId: _hallId,
        ShowScheduleId: _showId
      },
      options
    )
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
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
