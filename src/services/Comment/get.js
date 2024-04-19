/* eslint-disable no-useless-catch */
import Comment from '../../model/Comment.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { convertTimeToCurrentZone } from '../../utils/timeLib.js'
export const getAllService = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    // const data = await Food.paginate({}, options)
    // const data = await Food.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
    const data = await Comment.paginate({}, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No comment found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
export const getByMovieService = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      _movieId = ''
    } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'like userId',
        select: 'name avatar'
      }
    }
    // const data = await Food.paginate({}, options)
    // const data = await Food.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
    const data = await Comment.paginate({ movieId: _movieId }, options)
    const plainDocs = data.docs.map((doc) => doc.toObject())
    const comments = plainDocs.map((comment) => {
      return {
        ...comment,
        createdAt: convertTimeToCurrentZone(comment.createdAt)
      }
    })

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No comment found!')
    }
    return comments
  } catch (error) {
    throw error
  }
}
