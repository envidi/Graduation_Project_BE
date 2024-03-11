import { getAllService, getOneService, getAllServiceByShowTime } from './get.js'
import { createService } from './post.js'
import { removeService } from './delete.js'
import { updateService, updateStatusService } from './patch.js'

export const seatService = {
  createService,
  getOneService,
  getAllService,
  updateService,
  removeService,
  updateStatusService,
  getAllServiceByShowTime
}
