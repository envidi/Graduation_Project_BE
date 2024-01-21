import { getAllService, getOneService } from './get.js'
import { createService } from './post.js'
import { updateService } from './patch.js'
import { removeService } from './delete.js'
export const foodService = {
  getAllService,
  getOneService,
  createService,
  updateService,
  removeService
}