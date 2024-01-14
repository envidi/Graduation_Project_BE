import Showtimes from '../model/Showtimes.js'
import Movie from '../model/Movie.js'
import ScreeningRoom from '../model/ScreenRoom.js'
import { scheduleService } from '../services/ShowTime/index.js'
import ApiError from '../utils/ApiError.js'

import { StatusCodes } from 'http-status-codes'

import showtimesValidate from '../validations/showtimes.js'
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