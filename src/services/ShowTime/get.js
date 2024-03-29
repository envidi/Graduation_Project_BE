/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import Showtimes from '../../model/Showtimes.js'
import ApiError from '../../utils/ApiError.js'
import { convertTimeToCurrentZone } from '../../utils/timeLib.js'

export const getAllService = async (req) => {
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
      }
    }
    const data = await Showtimes.paginate({ destroy: false }, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list show found!')
    }
    const populateOptions = [
      { path: 'screenRoomId', select: 'name' },
      { path: 'movieId', select: 'name' }
    ];

    // Populate screenRoomId and movieId for each document
    for (const doc of data.docs) {
      await doc.populate(populateOptions);
    }
    return data
  } catch (error) {
    throw error
  }
}
export const getAllServiceByMovie = async (req) => {
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
      }
    }
    const data = await Showtimes.paginate(
      { destroy: false, _id: req.params.id, timeFrom: { $gt: new Date() } },
      options
    )
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list show found!')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const getOneService = async (req) => {
  try {
    const { id } = req.params
    const response = await Showtimes.paginate(
      { _id: id },
      {
        populate: {
          path: 'screenRoomId',
          select: 'name status'
        }
      }
    )
    const plainDocs = response.docs.map((doc) => doc.toObject())

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((showtime) => {
      showtime.timeFrom = convertTimeToCurrentZone(showtime.timeFrom)
      showtime.timeTo = convertTimeToCurrentZone(showtime.timeTo)
    })
    if (!response) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list Show found!')
    }
    return {
      ...response,
      docs: plainDocs
    }
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
      }
    }
    const data = await Showtimes.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
