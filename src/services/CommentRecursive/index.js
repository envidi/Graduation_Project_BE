import { getAllService,getAllByMovieService } from './get'
import { createService } from './post'
import { removeService } from './delete.js'
import { updateService } from './patch.js'
export const commentRecursiveService = {
  getAllService,
  getAllByMovieService,
  createService,
  removeService,
  updateService
}
