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
async function deleteCommentsWithSubcomments(commentId) {
  // Xóa comment hiện tại
  const curentComment = await Comment.findByIdAndDelete({ _id: commentId })
  if (curentComment.comments.length == 0) {
    return
  }

  // Tìm tất cả subcomments
  const subcomments = await Comment.find({ parentId: commentId })

  // Đệ quy xóa từng subcomment
  for (let subcomment of subcomments) {
    await deleteCommentsWithSubcomments(subcomment._id)
  }
}
export const removeSubService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // Tìm đối tượng Food theo ID trước khi cập nhật
    const commentCurrent = await Comment.findById(id)
    if (!commentCurrent) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Delete comment failed')
    }
    // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
    deleteCommentsWithSubcomments(id)
    if (commentCurrent.parentId !== null) {
      await Comment.updateOne(
        {
          _id: commentCurrent.parentId
        },
        {
          $pull: {
            comments: commentCurrent._id
          }
        }
      )
      return commentCurrent
    }
    await commentRecursive.updateOne(
      {
        movieId: commentCurrent.movieId
      },
      {
        $pull: {
          comments: commentCurrent._id
        }
      }
    )
    return commentCurrent
  } catch (error) {
    throw error
  }
}
