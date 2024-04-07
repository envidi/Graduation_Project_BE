/* eslint-disable no-useless-catch */
import Payment from '../../model/Payment'
import { StatusCodes } from 'http-status-codes'
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
      }
      // populate: {
      //   path: 'TimeSlotId',
      //   populate: {
      //     path: 'SeatId',
      //     select: 'status'
      //   }
      // }
    }
    const data = await Payment.paginate({ }, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No payment found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
