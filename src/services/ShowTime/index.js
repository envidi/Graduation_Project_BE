/* eslint-disable no-useless-catch */
import { createService } from './post.js'
import { deleteSoftService, removeService, restoreService } from './delete.js'
import { updateService } from './patch.js'
import { getAllService, getOneService, getAllIncludeDestroyService } from './get.js'


export const scheduleService = {
  getAllIncludeDestroyService,
  createService,
  deleteSoftService,
  restoreService,
  removeService,
  updateService,
  getOneService,
  getAllService

}
