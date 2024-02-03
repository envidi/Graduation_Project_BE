import { movieService } from '../services/Movie/index.js'
import { StatusCodes } from 'http-status-codes'
// import { get } from 'mongoose'

export const getAll = async (req, res, next) => {
  try {
    const data = await movieService.getAllService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    })
    // return res.status(StatusCodes.OK).json({
    //   message: 'Success',
    //   datas: {
    //     ...data,
    //     docs: plainDocs
    //   }
    // })
  } catch (error) {
    next(error)
  }
}
export const getAllSoftDelete = async (req, res, next) => {
  try {
    const data = await movieService.getAllSoftDeleteService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const getDetail = async (req, res, next) => {
  try {
    const data = await movieService.getDetailService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const update = async (req, res, next) => {
  try {
    const data = await movieService.updateService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const data = await movieService.createService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}

export const softDelete = async (req, res, next) => {
  try {
    const data = await movieService.softDeleteService(req)

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
    const data = await movieService.restoreService(req)

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
    const data = await movieService.removeService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
