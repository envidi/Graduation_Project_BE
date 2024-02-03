import { getAllService, getOneService } from './get';
import { createService } from './post';
import { updateService } from './patch';
import { removeService, removeHardService } from './delete'

export const ticketService = {
  getAllService,
  getOneService,
  createService,
  updateService,
  removeService,
  removeHardService
}