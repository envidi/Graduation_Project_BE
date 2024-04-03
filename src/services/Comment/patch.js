/* eslint-disable no-useless-catch */
import Comment from '../../model/Comment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'

export const likeService = async (reqBody) => {
  try {
    const body = reqBody.body
    const id = reqBody.params.id
    const commentCurrent = await Comment.findById(id)
    if (commentCurrent.like.includes(body.userId)) {
      await Comment.updateOne(
        {
          _id: id
        },
        {
          $pull: {
            like: body.userId
          }
        }
      )
      return commentCurrent
    }
    const data = await Comment.updateOne(
      {
        _id: id
      },
      {
        $addToSet: {
          like: body.userId
        }
      }
    )
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Like comment failed!')
    }

    return data
  } catch (error) {
    throw error
  }
}
