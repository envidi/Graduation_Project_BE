/* eslint-disable no-useless-catch */
import CommentRecursive from '../../model/commentRecursive'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'

export const createService = async (reqBody, newComment) => {
  try {
    // const { error } = commentValidationSchema.validate(body, { abortEarly: true })
    // if (error) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    // }
    const data = await CommentRecursive.create({
      ...reqBody
    })
    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Create comment recursive failed!'
      )
    }
    await CommentRecursive.updateOne(
      {
        _id: data._id
      },
      {
        $push: {
          comments: newComment
        }
      }
    )
    return data
  } catch (error) {
    throw error
  }
}
