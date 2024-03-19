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
export const getAllByUser = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      _userId = '1',
      _start = new Date('2024-03-01'),
      _end = new Date('2024-03-28'),
      _q = ''
    } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'priceId seatId  showtimeId paymentId screenRoomId movieId cinemaId',
        select:
          'CinemaName CinemaAdress price row column typeSeat name email timeFrom screenRoomId movieId typeBank typePayment name image categoryId'
      },
      select: {
        isDeleted: 0,
        updatedAt: 0
      }
    }
    // let query = [
    //   { 'movieId.name': { $regex: _q, $options: 'i' } },
    //   { 'cinemaId.CinemaName': { $regex: _q, $options: 'i' } },
    //   { 'screenRoomId.name': { $regex: _q, $options: 'i' } },
    //   { status: { $regex: _q, $options: 'i' } }
    // ]
    // if (mongoose.Types.ObjectId.isValid(_q)) {
    //   query = [{ _id: _q }]
    // }
    // console.log(query)
    const data = await Ticket.paginate(
      {
        isDeleted: false,
        userId: _userId,
        createdAt: {
          $gte: _start, // Lớn hơn hoặc bằng ngày bắt đầu
          $lte: _end // Nhỏ hơn hoặc bằng ngày kết thúc
        },
        // $or: [{ status: { $regex: _q, $options: 'i' } }]
      },
      options
    )
    const newData = await Promise.all(
      data.docs.map(async (d) => {
        const dataFoodIds = d.foods.map((food) => food.foodId)
        const categoryObject = await Category.find(
          {
            _id: {
              $in: d.movieId.categoryId
            }
          },
          'name'
        )
        const foods = await Food.find(
          {
            _id: {
              $in: dataFoodIds
            }
          },
          'name price'
        )
        const newFood = d.foods.map((food, index) => {
          return {
            _id: food._id,
            quantityFood: food.quantityFood,
            name: foods[index].name,
            price: foods[index].price
          }
        })

        return {
          ...d._doc,
          foods: newFood,
          createdAt: convertTimeToCurrentZone(d._doc.createdAt),
          showtimeId: {
            timeFrom: convertTimeToCurrentZone(d._doc.showtimeId.timeFrom)
          },
          movieId: {
            _id: d._doc.movieId._id,
            name: d._doc.movieId.name,
            image: d._doc.movieId.image,
            categoryId: [...categoryObject]
          },
          movieName: d._doc.movieId.name,
          screenName: d._doc.screenRoomId.name,
          cinemaName: d._doc.cinemaId.CinemaName
        }
      })
    )
    let searchData = searchByFields(newData, _q)
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
