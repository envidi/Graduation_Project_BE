/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { v2 as cloudinary } from 'cloudinary'

import Movie, { COMING_SOON, IS_SHOWING } from '../../model/Movie.js'
import ShowTime from '../../model/Showtimes.js'
import { convertTimeToCurrentZone } from '../../utils/timeLib.js'
import ApiError from '../../utils/ApiError.js'
import mongoose from 'mongoose'
// import {
//   convertTimeToCurrentZone,
//   convertTimeToIsoString
// } from '../utils/timeLib.js'
// import { get } from 'mongoose'

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
      populate: ['prices', 'showTimes']
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
  } catch (error) {
    throw error
  }
}
export const getAllMovieHomePage = async (reqBody) => {
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
        path: 'categoryId',
        select: 'name _id isDeleteable '
      }
    }
    const data = await Movie.paginate({ destroy: false }, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
    }
    // Convert Mongoose documents to plain JavaScript objects
    const plainDocs = data.docs.map((doc) => doc.toObject())

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((movie) => {
      movie.fromDate = convertTimeToCurrentZone(movie.fromDate)
      movie.toDate = convertTimeToCurrentZone(movie.toDate)
    })
    return {
      ...data,
      docs: plainDocs
    }
  } catch (error) {
    throw error
  }
}
export const getMovieStatus = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      status = IS_SHOWING
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'categoryId',
        select: 'name _id isDeleteable '
      },
      projection: {
        name: 1,
        categoryId: 1,
        duration: 1,
        author: 1,
        rate: 1,
        status: 1,
        slug: 1,
        image: 1,
        fromDate: 1
      }
    }
    const data = await Movie.paginate(
      { destroy: false, status: status },
      options
    )

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
    }
    // Convert Mongoose documents to plain JavaScript objects
    const plainDocs = data.docs.map((doc) => doc.toObject())

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((movie) => {
      movie.fromDate = convertTimeToCurrentZone(movie.fromDate)
      movie.toDate = convertTimeToCurrentZone(movie.toDate)
    })
    return {
      ...data,
      docs: plainDocs
    }
  } catch (error) {
    throw error
  }
}
export const searchMovie = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 9,
      _sort = 'createdAt',
      _order = 'asc',
      q = ''
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'categoryId',
        select: 'name _id isDeleteable '
      },
      projection: {
        name: 1,
        categoryId: 1,
        status: 1,
        slug: 1,
        image: 1
      }
    }

    const data = await Movie.paginate(
      {
        destroy: false,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { author: { $regex: q, $options: 'i' } },
          { actor: { $regex: q, $options: 'i' } }
        ]
      },
      options
    )

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
    }

    return {
      ...data
    }
  } catch (error) {
    throw error
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

      movie.price = priceObject ? priceObject.price : null
    })

    return {
      ...data,
      docs: plainDocs
    }
  } catch (error) {
    throw error
  }
}
export const getDetailService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Movie.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng movie
    const data = await Movie.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1
              }
            }
          ],
          as: 'categoryCol'
        }
      },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showTimes',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                movieId: 0,
                destroy: 0,
                createdAt: 0,
                updatedAt: 0
              }
            }
          ],
          as: 'showTimeCol'
        }
      },
      {
        $lookup: {
          from: 'movieprices',
          localField: 'prices',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                price: 1,
                dayType: 1
              }
            }
          ],
          as: 'moviePriceCol'
        }
      },
      {
        $project: {
          categoryId: 0,
          showTimes: 0
        }
      }
    ])
    const arrayShowTimeId = data[0].showTimeCol.map((showtime) => showtime._id)
    const populateCinema = await ShowTime.paginate(
      {
        _id: {
          $in: arrayShowTimeId
        }
      },
      {
        populate: {
          path: 'screenRoomId',
          select: 'name CinemaId status destroy ',
          populate: {
            path: 'CinemaId',
            select: '_id CinemaName CinemaAdress'
          }
        },
        projection: {
          screenRoomId: 1,
          _id: 0
        }
      }
    )

    const currentDate = new Date()
    const currentDay = currentDate.getDay() // Sunday is 0, Monday is 1, ..., Saturday is 6

    const getPriceByDay = data[0].moviePriceCol.filter((price) => {
      return currentDay >= 1 && currentDay <= 5
        ? price.dayType === 'weekday'
        : price.dayType === 'weekend'
    })

    const convertShowTime = data[0].showTimeCol.map((showTime, index) => {
      showTime.timeFrom = convertTimeToCurrentZone(showTime.timeFrom)
      showTime.timeTo = convertTimeToCurrentZone(showTime.timeTo)
      showTime.date = convertTimeToCurrentZone(showTime.date)
      showTime.cinemaId = populateCinema.docs[index].screenRoomId.CinemaId
      showTime.screenRoomId = populateCinema.docs[index].screenRoomId

      return showTime
    })
    const newData = {
      ...data[0],
      moviePriceCol: getPriceByDay,
      showTimeCol: convertShowTime,
      fromDate: convertTimeToCurrentZone(data[0].fromDate),
      toDate: convertTimeToCurrentZone(data[0].toDate)
    }
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movie found!')
    }

    return newData
  } catch (error) {
    // next(error)
    throw error
  }
}

export const getMovieByCategory = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Movie.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng movie
    const data = await Movie.findById(id)

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movie id found!')
    }
    const categoriesId = data.categoryId
    const relateMovie = await Movie.find({
      categoryId: {
        $in: categoriesId
      },
      _id: {
        $ne: id
      }
    }).populate('categoryId', '_id name')
    if (!relateMovie || relateMovie.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movie found!')
    }
    // console.log(relateMovie)
    const convertDateMovie = relateMovie.map((movie) => {
      const fromDateConvert = convertTimeToCurrentZone(movie.fromDate)
      const toDateConvert = convertTimeToCurrentZone(movie.toDate)
      return {
        ...movie._doc,
        fromDate: fromDateConvert,
        toDate: toDateConvert
      }
    })
    return convertDateMovie
  } catch (error) {
    throw error
  }
}
