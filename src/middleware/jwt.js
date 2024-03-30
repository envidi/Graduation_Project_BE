import jwt from 'jsonwebtoken'
import { env } from '../config/environment.js'

export const AccessTokenUser = (uid, role) => {
  return jwt.sign({ _id: uid, role }, env.JWT_SECRET, { expiresIn: '3d' })
}
export const accessPaymentToken = (ticketId) => {
  return jwt.sign({ _id: ticketId }, env.JWT_SECRET, { expiresIn: '1d' })
}
export const accessResultToken = (ticketId, paymentId) => {
  return jwt.sign({ _id: ticketId, paymentId: paymentId }, env.JWT_SECRET, {
    expiresIn: '180sec'
  })
}
