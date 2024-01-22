/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'

import TimeSlot from '../../model/TimeSlot.js'
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
      },
      populate: {
        path: 'SeatId',
        select: 'TimeSlotId typeSeat status'
      }
    }
    const data = await TimeSlot.paginate({ destroy: false }, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No timeslot found!')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const getOneService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await TimeSlot.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng TimeSlot
    const data = await TimeSlot.aggregate([
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
          Show_scheduleId: 1,
          ScreenRoomId: 1,
          SeatColumn: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No timeslot found!')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const getTimeSlotIdWithScreenRoomId = async (reqBody) => {
  try {
    const { showTimeId, screenRoomId } = reqBody
    // const data = await TimeSlot.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng TimeSlot
    const data = await TimeSlot.findOne({
      $and: [{ Show_scheduleId: showTimeId }, { ScreenRoomId: screenRoomId }]
    })

    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No timeslot found!')
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
        path: 'SeatId',
        select: 'TimeSlotId typeSeat status'
      }
    }
    const data = await TimeSlot.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No timeslot found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
