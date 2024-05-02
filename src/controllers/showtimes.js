import { scheduleService } from '../services/ShowTime/index.js'

import { StatusCodes } from 'http-status-codes'

export const AVAILABLE = 'Available'
export const ISCOMING = 'IsComming'
export const statusScreen = [AVAILABLE, ISCOMING]
export const createShowTime = async (req, res, next) => {
  try {

    const data = await scheduleService.createService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Tạo lịch chiếu thành công',
      data
    })
  } catch (error) {
    next(error)
  }
}

export const getAllShow = async (req, res, next) => {
  try {

    const response = await scheduleService.getAllService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Gọi danh sách lịch chiếu thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}
export const getAllApprovalShow = async (req, res, next) => {
  try {

    const response = await scheduleService.getAllApprovalService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Gọi danh sách lịch chiếu thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}
export const getAllShowByMovie = async (req, res, next) => {
  try {

    const response = await scheduleService.getAllServiceByMovie(req)

    return res.status(StatusCodes.OK).json({
      message: 'Gọi danh sách lịch chiếu thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}

export const getDetailShow = async (req, res, next) => {
  try {

    const response = await scheduleService.getOneService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Gọi  lịch chiếu thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}

export const deleteShow = async (req, res, next) => {
  try {

    const response = await scheduleService.removeService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Xóa  lịch chiếu thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}
export const deleteSoftShow = async (req, res, next) => {
  try {
    const response = await scheduleService.deleteSoftService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Xóa mềm lịch chiếu thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}
export const restoreShow = async (req, res, next) => {
  try {
    const response = await scheduleService.restoreService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Khôi phục lịch chiếu thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}

export const updateShowTime = async (req, res, next) => {
  try {
    const updatedShow = await scheduleService.updateService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Cập nhật lịch chiếu thành công',
      data: updatedShow
    })
  } catch (error) {
    next(error)
  }
}
export const updateMovieShowTime = async (req, res, next) => {
  try {
    const updatedShow = await scheduleService.updateMovieShowService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Cập nhật lịch chiếu thành công',
      data: updatedShow
    })
  } catch (error) {
    next(error)
  }
}
export const updateApprovalShowTime = async (req, res, next) => {
  try {
    const id = req.params.id
    const updatedShow = await scheduleService.updateApproval(id)

    return res.status(StatusCodes.OK).json({
      message: 'Cập nhật lịch chiếu thành công',
      data: updatedShow
    })
  } catch (error) {
    next(error)
  }
}
export const getAllIncludeDestroy = async (req, res, next) => {
  try {
    const updatedShow = await scheduleService.getAllIncludeDestroyService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Cập nhật lịch chiếu thành công',
      data: updatedShow
    })
  } catch (error) {
    next(error)
  }
}