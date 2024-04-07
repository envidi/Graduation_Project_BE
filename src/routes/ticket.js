import express from 'express'
import {
  create,
  getAll,
  getDetail,
  remove,
  update,
  removeHard,
  checkoutPaymentSeat,
  getAllTicketByUser
} from '../controllers/ticket'
import { verifyAccessPaymentToken } from '../middleware/verifyToken'
const routerTicket = express.Router()

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerTicket.get('/', getAll)
routerTicket.get('/user', getAllTicketByUser)
routerTicket.get('/:id', getDetail)
routerTicket.patch('/:id', update)
routerTicket.patch('/status/:id', verifyAccessPaymentToken, checkoutPaymentSeat)
routerTicket.post('/', create)
routerTicket.delete('/:id', remove)
routerTicket.delete('/delete/:id', removeHard)

export default routerTicket
