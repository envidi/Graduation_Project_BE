
import { StatusCodes } from 'http-status-codes'
import { v2 as cloudinary } from 'cloudinary';

import Movie from '../../model/Movie.js'
import { convertTimeToCurrentZone } from '../../utils/timeLib.js';
// import {
//   convertTimeToCurrentZone,
//   convertTimeToIsoString
// } from '../utils/timeLib.js'
// import { get } from 'mongoose'

const checkImageExists = async (public_id) => {
    // console.log('public_id:', public_id);
    try {
      const result = await cloudinary.api.resource(public_id);
      return result ? true : false;
    } catch (error) {
      // console.log('Error checking image:', error.message);
      return false;
    }
  };

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
      populate: 'prices'
    }
    const data = await Movie.paginate({ destroy: false }, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
    }
    // Convert Mongoose documents to plain JavaScript objects
    const plainDocs = data.docs.map((doc) => doc.toObject())

    const currentDate = new Date()
    const currentDay = currentDate.getDay() // Sunday is 0, Monday is 1, ..., Saturday is 6

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((movie) => {
      const priceObject = movie.prices.find((price) => {
        return currentDay >= 1 && currentDay <= 5
          ? price.dayType === 'weekday'
          : price.dayType === 'weekend'
      })

      movie.price = priceObject ? priceObject.price : null
    })
        return {
            ...data,
            docs: plainDocs
          }
    // return res.status(StatusCodes.OK).json({
    //   message: 'Success',
    //   datas: {
    //     ...data,
    //     docs: plainDocs
    //   }
    // })
  } catch (error) {
    next(error)
  }
}
export const getAllSoftDeleteService = async (reqBody) => {
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
      populate: 'prices'
    }
    const data = await Movie.paginate({ destroy: true }, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
    }
    // Convert Mongoose documents to plain JavaScript objects
    const plainDocs = data.docs.map((doc) => doc.toObject())

    const currentDate = new Date()
    const currentDay = currentDate.getDay() // Sunday is 0, Monday is 1, ..., Saturday is 6

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((movie) => {
      const priceObject = movie.prices.find((price) => {
        return currentDay >= 1 && currentDay <= 5
          ? price.dayType === 'weekday'
          : price.dayType === 'weekend'
      })

      // movie.price = priceObject ? priceObject.price : null
    })
    console.log(data,plainDocs)
    return {
        ...data,
        docs: plainDocs
      } 
    // return res.status(StatusCodes.OK).json({
    //   message: 'Success',
    //   datas: {
    //     ...data,
    //     docs: plainDocs
    //   }
    // })
  } catch (error) {
    next(error)
  }
}
export const getDetailService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    const data = await Movie.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng movie
    // const data = await Movie.aggregate([
    //   {
    //     $match : {
    //       _id : new mongoose.Types.ObjectId(id)
    //     }
    //   },
    //   {
    //     $lookup : {
    //       from : 'categories',
    //       localField : 'categoryId',
    //       foreignField : '_id',
    //       as : 'categoryCol'
    //     }
    //   },
    //   {
    //     $project : {
    //       name : 1,
    //       author : 1,
    //       categoryCol : 1
    //     }
    //   }

    // ])
    const newData = { 
      ...data._doc,
      fromDate: convertTimeToCurrentZone(data.fromDate),
      toDate: convertTimeToCurrentZone(data.toDate)
    }
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movie found!')
    }
    // return res.status(StatusCodes.OK).json({
    //   message: 'Success',
    //   datas: newData
    // })

    return newData
  } catch (error) {
    next(error)
  }
}
