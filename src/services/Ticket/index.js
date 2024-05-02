import { getAllService, getOneService, getAllByUser, getAllServiceFontend, getDetailService, getAllServiceDataTable, getAllReserved } from './get';
import { createService } from './post';
import { updateService, updatePaymentTicketService } from './patch';
import { removeService, removeHardService } from './delete'

export const ticketService = {
  getAllService,
  getOneService,
  createService,
  updateService,
  removeService,
  removeHardService,
  updatePaymentTicketService,
  getAllByUser,
  getAllServiceFontend,
  getDetailService,
  getAllServiceDataTable,
  getAllReserved
}