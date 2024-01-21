import { StatusCodes } from 'http-status-codes'
import { timeSlotService } from '../services/TimeSlot/index.js'

export const getAll = async (req, res, next) => {
  try {
    const data = await timeSlotService.getAllService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}
export const getAllInCludeDestroy = async (req, res, next) => {
  try {
    const data = await timeSlotService.getAllIncludeDestroyService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    const data = await timeSlotService.getOneService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const updateData = await timeSlotService.updateService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      datas: updateData
    })
  } catch (error) {
    next(error)
  }
}

export const createForPostMan = async (req, res, next) => {
  try {
    const data = await timeSlotService.createForPostManService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const createForFe = async (req, res, next) => {
  try {
    const data = await timeSlotService.createService(req.body)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const deleteSoft = async (req, res, next) => {
  try {
    const data = await timeSlotService.deleteSoftService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const restore = async (req, res, next) => {
  try {
    const data = await timeSlotService.restoreService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const remove = async (req, res, next) => {
  try {
    const data = await timeSlotService.removeService(req.params.id)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
