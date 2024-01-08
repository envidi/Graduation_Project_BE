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
        [_sort]: _order === 'asc' ? 1 : -1,

      },
      populate : {
        path : 'TimeSlotId',
        populate : { 
          path : 'SeatId',
          select : 'status'
        }
      }

    }
    const data = await ScreeningRoom.paginate({ destroy: false }, options)
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

export const getAllIncludeDestroyService = async (reqBody) => {
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
      },
      populate: {
        path: 'TimeSlotId',
        select: 'ScreeningRoomId SeatId status destroy'
      }
    }
    const data = await ScreeningRoom.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
