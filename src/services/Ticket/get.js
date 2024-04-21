/* eslint-disable no-useless-catch */
import Ticket from '../../model/Ticket'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import Food from '../../model/Food'
import Category from '../../model/Category'
import { convertTimeToCurrentZone } from '../../utils/timeLib'
import mongoose from 'mongoose'
import { searchByFields } from '../../utils/ToStringArray'
export const getAllService = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      includeDeleted // Thêm tham số này để kiểm tra query parameter
    } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string

    const queryCondition = includeDeleted === 'true' ? {} : { isDeleted: false }

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    // const data = await Ticket.paginate({}, options)
    // const data = await Ticket.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
    const data = await Ticket.paginate(queryCondition, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Ticket found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
export const getAllServiceFontend = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      includeDeleted // Thêm tham số này để kiểm tra query parameter
    } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string

    const queryCondition = includeDeleted === 'true' ? {} : { isDeleted: false }

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'priceId paymentId userId',
        select: 'price name email timeFrom typeBank typePayment'
      },
    }
    // const data = await Ticket.paginate({}, options)
    // const data = await Ticket.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
    const data = await Ticket.paginate(queryCondition, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Ticket found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
export const getAllByUser = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      _userId = '1',
      _start = new Date('2024-03-01'),
      _end = new Date('2024-09-26'),
      _q = null
    } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'priceId paymentId',
        select: 'price name email timeFrom typeBank typePayment'
      },
      select: {
        isDeleted: 0,
        updatedAt: 0
      }
    }

    const data = await Ticket.paginate(
      {
        isDeleted: false,
        userId: _userId,
        createdAt: {
          $gte: _start, // Lớn hơn hoặc bằng ngày bắt đầu
          $lte: _end // Nhỏ hơn hoặc bằng ngày kết thúc
        }
        // $or: query
      },
      options
    )
    const newData = await Promise.all(
      data.docs.map(async (d) => {
        return {
          ...d._doc,
          createdAt: convertTimeToCurrentZone(d._doc.createdAt),
          movieName: d._doc.movieId.name,
          screenName: d._doc.screenRoomId.name,
          cinemaName: d._doc.cinemaId.CinemaName
        }
      })
    )
    let searchData = _q == null ? newData : searchByFields(newData, _q)
    if (!newData || newData.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Ticket found!')
    }
    return searchData
  } catch (error) {
    throw error
  }
}

export const getOneService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Ticket.findById(id)
    // const data = await Ticket.findOne({ _id: id, isDeleted: false }); // Kiểm tra thêm điều kiện không bị xóa mềm
    const { includeDeleted } = reqBody.query // lấy tham số includeDeleted từ query string
    const queryCondition =
      includeDeleted === 'true' ? { _id: id } : { _id: id, isDeleted: false }
    const data = await Ticket.findOne(queryCondition)
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not Ticket found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
