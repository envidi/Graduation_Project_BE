import { StatusCodes } from 'http-status-codes'
import { ticketService } from '../services/Ticket/index'

export const getAll = async (req, res, next) => {
  try {
    const data = await ticketService.getAllService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}
export const getAllFontend = async (req, res, next) => {
  try {
    const data = await ticketService.getAllServiceFontend(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    const data = await ticketService.getOneService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}
export const create = async (req, res, next) => {
  try {
    const data = await ticketService.createService(req)
    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const getAllTicketByUser = async (req, res, next) => {
  try {
    const data = await ticketService.getAllByUser(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const data = await ticketService.updateService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Ticket updated successfully', // Thành công
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const checkoutPaymentSeat = async (req, res, next) => {
  try {
    const updateData = await ticketService.updatePaymentTicketService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      datas: updateData
    })
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const data = await ticketService.removeService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Ticket removed successfully',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const removeHard = async (req, res, next) => {
  try {
    const data = await ticketService.removeHardService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Ticket removed successfully',
      data
    })
  } catch (error) {
    next(error)
  }
}
