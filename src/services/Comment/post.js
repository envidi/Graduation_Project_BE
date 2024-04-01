/* eslint-disable no-useless-catch */
import Comment from '../../model/Comment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import { commentRecursiveService } from '../CommentRecursive'
import commentValidationSchema, {
  replyCommentValidationSchema
} from '../../validations/comment'

export const createService = async (reqBody) => {
  try {
    const { empty = false, ...body } = reqBody.body

    const { error } = commentValidationSchema.validate(body, {
      abortEarly: true
    })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Comment.create({
      ...body
    })
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create comment failed!')
    }
    if (empty) {
      await commentRecursiveService.createService(
        {
          movieId: body.movieId,
          comments: []
        },
        data._id
      )
      return data
    }
    await commentRecursiveService.updateService(
      {
        movieId: body.movieId
      },
      data._id
    )
    return data
  } catch (error) {
    throw error
  }
}
export const replyService = async (reqBody) => {
  try {
    const body = reqBody.body

    const { error } = replyCommentValidationSchema.validate(body, {
      abortEarly: true
    })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Comment.create({
      ...body
    })

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create comment failed!')
    }
    await Comment.updateOne(
      {
        _id: data.parentId
      },
      {
        $push: {
          comments: data._id
        }
      }
    )
    return data
  } catch (error) {
    throw error
  }
}
