import { createService, replyService } from './post'
import { removeService } from './delete'
import { getAllService } from './get'
export const commentService = {
  createService,
  getAllService,
  removeService,
  replyService
}
