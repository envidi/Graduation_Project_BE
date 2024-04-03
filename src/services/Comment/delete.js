/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import Comment from '../../model/Comment.js'
import commentRecursive from '../../model/commentRecursive.js'
export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Food theo ID trước khi cập nhật
    const commentCurrent = await Comment.findById(id)
    if (commentCurrent.comments.length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This comment has sub children. Delete sub children before delete this comment!'
      )
    }
    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    const data = await Comment.findByIdAndDelete(id)

    if (!data || Object.keys(data).length == 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Delete comment failed')
    }
    if (data.parentId !== null) {
      await Comment.updateOne(
        {
          _id: data.parentId
        },
        {
          $pull: {
            comments: data._id
          }
        }
      )
      return data
    }
    await commentRecursive.updateOne(
      {
        movieId: data.movieId
      },
      {
        $pull: {
          comments: data._id
        }
      }
    )
    return data
  } catch (error) {
    throw error
  }
}
