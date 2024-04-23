/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'

import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import { convertTimeToCurrentZone } from '../../utils/timeLib.js'
import { AVAILABLE, NORMAL, SOLD, VIP } from '../../model/Seat.js'

export const getAllService = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 25,
      _sort = 'createdAt',
      _order = 'asc'
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'CinemaId ShowtimesId',
        select: 'CinemaName CinemaAdress timeFrom timeTo' // Specify the fields you want to select
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
export const getAllDestroyService = async (req) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = req.query

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'CinemaId ShowtimesId',
        select: 'CinemaName CinemaAdress timeFrom timeTo' // Specify the fields you want to select
      }
    }

    const data = await ScreeningRoom.paginate({ destroy: true }, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'No soft-deleted screening rooms found!'
      )
    }
    return data
  } catch (error) {
    // console.log(error);
    throw error
  }
}
export const getOneService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await ScreeningRoom.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng ScreeningRoom
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
      },
      populate: {
        path: 'ShowtimesId',
        select: 'movieId date timeFrom timeTo status SeatId',
        populate: {
          path: 'SeatId movieId',
          select: 'name status typeSeat price'
        }
        // Specify the fields you want to select,
      },
      projection: {
        CinemaId: 0,
        updatedAt: 0,
        createdAt: 0,
        destroy: 0
      }
    }
    const data = await ScreeningRoom.paginate({ _id: id }, options)
    const plainDocs = data.docs.map((doc) => doc.toObject())
    const showTime = plainDocs[0].ShowtimesId.map((showtime) => {
      const seatSold = showtime.SeatId.filter((seat) => {
        return seat.status === SOLD
      })
      const seatNotSold = showtime.SeatId.filter((seat) => {
        return seat.status === AVAILABLE
      })
      const seatVip = showtime.SeatId.filter((seat) => {
        return seat.typeSeat === VIP
      })
      const seatNormal = showtime.SeatId.filter((seat) => {
        return seat.typeSeat === NORMAL
      })
      return {
        ...showtime,
        date: convertTimeToCurrentZone(showtime.date),
        timeFrom: convertTimeToCurrentZone(showtime.timeFrom),
        timeTo: convertTimeToCurrentZone(showtime.timeTo),
        SeatId : {
          seatSold : seatSold.length,
          seatNotSold: seatNotSold.length,
          seatVip,
          seatNormal
        }
      }
    })

    // const data = await ScreeningRoom.aggregate([
    //   {
    //     $match: {
    //       _id: new mongoose.Types.ObjectId(id)
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: 'showtimes',
    //       localField: 'ShowtimesId',
    //       foreignField: '_id',
    //       pipeline: [
    //         {
    //           $project: {
    //             screenRoomId: 0
    //           }
    //         }
    //       ],
    //       as: 'ShowColumn'
    //     }
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       status: 1,
    //       CinemaId: 1,
    //       ShowColumn: 1,
    //       createdAt: 1,
    //       updatedAt: 1
    //     }
    //   }
    // ])
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return {
      ...plainDocs[0],
      ShowtimesId: showTime
    }
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
    } = req.query

    // Tạo điều kiện truy vấn dựa trên CinemaId nếu nó được cung cấp
    const queryCondition = CinemaId ? { CinemaId } : {}

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'ShowtimesId' // Duy trì việc populate nếu bạn muốn lấy thông tin chi tiết của Showtimes liên quan
      }
    }

    // Sử dụng điều kiện truy vấn khi gọi phương thức paginate
    const data = await ScreeningRoom.paginate(queryCondition, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
