/* eslint-disable no-useless-catch */
import CommentRecursive from '../../model/commentRecursive'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'

export const updateService = async (reqBody, newComment) => {
  try {
    // const { error } = commentValidationSchema.validate(body, { abortEarly: true })
    // if (error) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    // }
    const data = await CommentRecursive.updateOne(
      {
        movieId: reqBody.movieId
      },
      {
        $push: {
          comments: newComment
        }
      }
    )
    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'update comment recursive failed!'
      )
    }

    return data
  } catch (error) {
    throw error
  }
}
