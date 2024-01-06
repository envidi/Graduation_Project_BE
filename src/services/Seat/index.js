import { getAllService, getOneService } from './get.js'
import { createService } from './post.js'
import { removeService } from './delete.js'
import { updateService } from './patch.js'

export const seatService = {
  createService,
  getOneService,
  getAllService,
  updateService,
  removeService
}
