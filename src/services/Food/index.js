import { getAllService, getFoodDestroyService, getOneService } from './get.js'
import { createService } from './post.js'
import { updateService, updateDeletedService, restoreService } from './patch.js'
import { removeService } from './delete.js'
export const foodService = {
  getAllService,
  getOneService,
  createService,
  updateService,
  updateDeletedService,
  removeService,
  getFoodDestroyService,
  restoreService
}