/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import WatchList from '../../model/WatchList'
import ApiError from '../../utils/ApiError'
export const getAllService = async (req) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = req.query
    const userId = req.params.id
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'movieId',
        select:
          'name image duration country age_limit categoryId desc rate slug',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      }
    }
    const data = await WatchList.paginate(
      { destroy: false, userId: userId },
      options
    )
    if (!data || data.docs.length === 0) {
      return {
        docs : []
      }
    }
    return data
  } catch (error) {
    throw error
  }
}
