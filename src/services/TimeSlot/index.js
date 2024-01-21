/* eslint-disable no-useless-catch */
import TimeSlot from '../../model/TimeSlot.js'
import { createService } from './post.js'
import { deleteSoftService, removeService, restoreService } from './delete.js'
import { updateService } from './patch.js'
import { getAllService, getOneService, getAllIncludeDestroyService,getTimeSlotIdWithScreenRoomId } from './get.js'


export const findSingleDocument = async (id) => {
  try {
    const data = await TimeSlot.findById(id)
    return data
  } catch (error) {
    throw error
  }
}


export const timeSlotService = {
  getAllIncludeDestroyService,
  createService,
  findSingleDocument,
  deleteSoftService,
  restoreService,
  removeService,
  updateService,
  getOneService,
  getAllService,
  getTimeSlotIdWithScreenRoomId

}
