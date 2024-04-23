/* eslint-disable no-useless-catch */
import { createService } from './post.js'
import { deleteSoftService, removeService, restoreService, deleteShowTime } from './delete.js'
import { updateMovieShowService, updateService, updateStatusFull } from './patch.js'
import { getAllService, getOneService, getAllIncludeDestroyService, getAllServiceByMovie } from './get.js'


export const scheduleService = {
  getAllIncludeDestroyService,
  createService,
  deleteSoftService,
  restoreService,
  removeService,
  updateService,
  getOneService,
  getAllService,
  updateStatusFull,
  deleteShowTime,
  getAllServiceByMovie,
  updateMovieShowService
}
