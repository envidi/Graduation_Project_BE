import { createService, replyService } from './post'
import { removeService } from './delete'
import { getAllService } from './get'
import { likeService } from './patch'
export const commentService = {
  createService,
  getAllService,
  removeService,
  replyService,
  likeService
}
