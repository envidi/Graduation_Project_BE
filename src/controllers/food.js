import { foodService } from '../services/Food/index'
import { StatusCodes } from 'http-status-codes'

export const getAll = async (req, res, next) => {
  try {
    const data = await foodService.getAllService(req)
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
    const data = await foodService.getOneService(req)

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
    const updateData = await foodService.updateService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data: updateData
    })
  } catch (error) {
    next(error)
  }
}

export const updateDeleted = async (req, res, next) => {
  try {
    const updateDeletedData = await foodService.updateDeletedService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data: updateDeletedData
    })
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const data = await foodService.createService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const data = await foodService.removeService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
