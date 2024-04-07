import { StatusCodes } from 'http-status-codes'
import { paymentService } from '../../services/Payment'

export const getAll = async (req, res, next) => {
  try {
    const data = await paymentService.getAllService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    })
  } catch (error) {
    next(error)
  }
}
