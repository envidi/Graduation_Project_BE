/* eslint-disable no-useless-catch */
import Payment from '../../model/Payment.js'

export const createService = async (req) => {
  try {
    const payment = await Payment.create({
      amount: req.amount,
      typePayment: req.typePayment,
      typeBank:req.typeBank,
      ticketId: req.ticketId
    })

    return payment
  } catch (error) {
    throw error
  }
}
