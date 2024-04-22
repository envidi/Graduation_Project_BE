import { createService, replyService } from './post'
import { removeService, removeSubService } from './delete'
import { getAllService, getByMovieService } from './get'
import { likeService } from './patch'
export const commentService = {
  createService,
  getAllService,
  removeService,
  replyService,
  likeService,
  removeSubService,
  getByMovieService
}
