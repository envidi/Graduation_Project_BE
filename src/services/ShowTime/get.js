/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import Showtimes from '../../model/Showtimes.js'
import ScreeningRoom from '../../model/ScreenRoom.js'
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
    return data
  } catch (error) {
    throw error
  }
}

export const getOneService = async (req) => {
  try {
    const { id } = req.params
    const response = await Showtimes.findById(id)

    const newData = {
      ...response._doc,
      timeFrom : convertTimeToCurrentZone(response.timeFrom),
      timeTo : convertTimeToCurrentZone(response.timeTo),
    }
    if (!response) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list Show found!')
    }
    return newData
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
