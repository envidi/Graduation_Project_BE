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
