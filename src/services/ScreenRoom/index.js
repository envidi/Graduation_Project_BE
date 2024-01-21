/* eslint-disable no-useless-catch */
import ScreeningRoom from '../../model/ScreenRoom.js'
import { createService, createForPostManService } from './post.js'
import { deleteSoftService, removeService, restoreService } from './delete.js'
import { updateService, updateStatusScreen } from './patch.js'
import { getAllService, getOneService, getAllIncludeDestroyService } from './get.js'


export const findSingleDocument = async (id) => {
  try {
    const data = await ScreeningRoom.findById(id)
    return data
  } catch (error) {
    throw error
  }
}


export const screenRoomService = {
  getAllIncludeDestroyService,
  createService,
  findSingleDocument,
  deleteSoftService,
  restoreService,
  removeService,
  createForPostManService,
  updateService,
  getOneService,
  getAllService,
  updateStatusScreen

}
