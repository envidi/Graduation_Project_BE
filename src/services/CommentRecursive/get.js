/* eslint-disable no-useless-catch */
import User from '../../model/user.js'
import Comment from '../../model/Comment.js'
import CommentRecursive from '../../model/commentRecursive.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
async function recursivePopulate(commentNested) {
  if (commentNested.length == 0) {
    return
  }

  const comments = await Comment.find({
    _id: {
      $in: commentNested
    }
  }).populate('comments userId', 'name avatar')
  const promises = comments.map(async (replyDoc) => {
    const total = await recursivePopulate(replyDoc.comments)

    return {
      ...replyDoc._doc,
      comments: total ?? []
    }
  })

  const result = await Promise.all(promises)

  return result
}
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
      },
      populate: {
        path: 'comments'
      }
    }
    const data = await CommentRecursive.paginate({}, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No comment recursive found!')
    }
    const comments = data.docs[0].comments.map(async (comment) => {
      const user = await User.findById(comment.userId).select('name avatar')
      const result = await recursivePopulate(comment.comments)
      return {
        ...comment._doc,
        userId: user,
        comments: result
      }
    })
    const result = await Promise.all(comments)

    // return {
    //   ...data.docs[0]._doc,
    //   comments: result
    // }
    return data
  } catch (error) {
    throw error
  }
}
export const getAllByMovieService = async (reqBody) => {
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
      },
      populate: {
        path: 'comments'
      }
    }
    const data = await CommentRecursive.paginate(
      {
        movieId: reqBody.params.id
      },
      options
    )

    if (!data || data.docs.length === 0) {
      return []
    }
    const comments = data.docs[0].comments.map(async (comment) => {
      const user = await User.findById(comment.userId).select('name avatar')
      const result = await recursivePopulate(comment.comments)
      return {
        ...comment._doc,
        userId: user,
        comments: result
      }
    })
    const result = await Promise.all(comments)

    return {
      ...data.docs[0]._doc,
      comments: result
    }
  } catch (error) {
    throw error
  }
}
