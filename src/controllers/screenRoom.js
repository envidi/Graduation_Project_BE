import { StatusCodes } from 'http-status-codes'
import { screenRoomService } from '../services/ScreenRoom/index.js'

export const getAll = async (req, res, next) => {
  try {
    const data = await screenRoomService.getAllService(req)

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
    const data = await screenRoomService.getAllIncludeDestroyService(req)

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
    const data = await screenRoomService.getOneService(req)

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
    const updateData = await screenRoomService.updateService(req)

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
    const data = await screenRoomService.createForPostManService(req)

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
    const data = await screenRoomService.createService(req)

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
    const data = await screenRoomService.deleteSoftService(req)

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
    const data = await screenRoomService.restoreService(req)

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
    const data = await screenRoomService.removeService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
