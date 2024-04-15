/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import Movie, { IS_SHOWING } from '../../model/Movie.js'
import ShowTime, { AVAILABLE_SCHEDULE } from '../../model/Showtimes.js'
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
      _limit = 50,
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
    // const plainDocs = data.docs.map((doc) => doc.toObject())

    // const currentDate = new Date()
    // const currentDay = currentDate.getDay() // Sunday is 0, Monday is 1, ..., Saturday is 6

    // Add the 'price' field to each movie based on the current day type
    // plainDocs.forEach((movie) => {
    //   const priceObject = movie.prices?.find((price) => {
    //     return currentDay >= 1 && currentDay <= 5
    //       ? price.dayType === 'weekday'
    //       : price.dayType === 'weekend'
    //   })

    //   movie.price = priceObject ? priceObject.price : null
    // })
    return {
      ...data,
      // docs: plainDocs
    }
  } catch (error) {
    throw error
  }
}
export const getAllHasShow = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 50,
      _sort = 'createdAt',
      _order = 'asc',
      _cate = ''
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'showTimes',
        select: 'timeFrom status '
      },
      projection: 'name image showTimes status slug categoryId'
    }
    let query = {
      destroy: false,
      status: IS_SHOWING,
      $expr: { $gt: [{ $size: '$showTimes' }, 0] }
    }
    if (_cate !== '') {
      query = {
        destroy: false,
        status: IS_SHOWING,
        $expr: { $gt: [{ $size: '$showTimes' }, 0] },
        categoryId: {
          $in: [_cate]
        }
      }
    }
    const data = await Movie.paginate(query, options)

    if (!data || data.docs.length === 0) {
      return []
    }
    // Convert Mongoose documents to plain JavaScript objects
    const plainDocs = data.docs.map((doc) => doc.toObject())

    // const currentDate = new Date()
    // const currentDay = currentDate.getDay() // Sunday is 0, Monday is 1, ..., Saturday is 6

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((movie) => {
      movie.showTimes = movie.showTimes.filter(
        (show) => show.timeFrom > new Date()
      )
    })
    return {
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
      _limit = 50,
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
export const getCountMovie = async () => {
  try {
    const data = await Movie.countDocuments({})

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
    }

    return data
  } catch (error) {
    throw error
  }
}
export const getMovieStatus = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 50,
      _sort = 'createdAt',
      _order = 'asc',
      status = IS_SHOWING,
      _country = '0',
      _rate = '0',
      _age = '0'
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
        country: 1,
        age_limit: 1,
        fromDate: 1
      }
    }
    let query = {
      destroy: false,
      status: status
    }
    if (_country !== '0') {
      query = {
        ...query,
        country: _country
      }
    }
    if (_rate != 0 || _rate != '0') {
      query = {
        ...query,
        rate: _rate
      }
    }
    if (_age != 0 || _age != '0') {
      query = {
        ...query,
        age_limit: {
          $lte: _age
        }
      }
    }
    const data = await Movie.paginate(query, options)

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
                SeatId: 0,
                movieId: 0,
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
    // console.log(data[0].showTimeCol)

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

    let convertShowTime = data[0].showTimeCol
    convertShowTime = convertShowTime
      .map((showTime, index) => {
        if (showTime.destroy) return
        // showTime.timeFrom = convertTimeToCurrentZone(showTime.timeFrom)
        // showTime.timeTo = convertTimeToCurrentZone(showTime.timeTo)
        return {
          date: showTime.date,
          timeFrom: convertTimeToCurrentZone(showTime.timeFrom),
          timeTo: convertTimeToCurrentZone(showTime.timeTo),
          cinemaId: populateCinema.docs[index]?.screenRoomId?.CinemaId,
          screenRoomId: populateCinema.docs[index].screenRoomId,
          status: showTime.status
        }
      })
      .filter((showtime) => showtime != null)

    let condition = false
    const arrayDemension = []
    const showTimeDimension = data[0].showTimeCol
      .map((showTime) => {
        if (condition) return
        const currentShowtime = showTime.timeFrom
        const currentArray = data[0].showTimeCol
          .map((showTimeDemension) => {
            if (
              showTimeDemension.timeFrom.getDate() ===
                currentShowtime.getDate() &&
              showTimeDemension.status == AVAILABLE_SCHEDULE &&
              !showTimeDemension.destroy
            ) {
              return {
                ...showTimeDemension,
                timeFrom: convertTimeToCurrentZone(showTimeDemension.timeFrom),
                date: showTimeDemension.date
              }
            }
          })
          .filter((showTime) => showTime != null)
        arrayDemension.push([...currentArray])
        const currentLength = arrayDemension.flatMap((element) => element)
        if (currentLength.length === data[0].showTimeCol.length) {
          condition = true
        }

        return [...currentArray]
      })
      .filter((showTime) => showTime != null)

    const newData = {
      ...data[0],
      moviePriceCol: getPriceByDay,
      showTimeCol: convertShowTime,
      showTimeDimension,
      fromDate: convertTimeToCurrentZone(data[0].fromDate),
      toDate: convertTimeToCurrentZone(data[0].toDate)
    }

    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movie found!')
    }

    return newData
  } catch (error) {
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
