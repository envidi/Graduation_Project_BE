import { getAllService } from './get'
import { createService } from './post'
import { removeService } from './delete.js'
import { updateService } from './patch.js'
export const commentRecursiveService = {
  getAllService,
  createService,
  removeService,
  updateService
}
