// import Product from '../models/Product.js';
import Seat, { AVAILABLE, RESERVED, SOLD, UNAVAILABLE } from '../model/Seat.js'
import { AVAILABLE as AvailableRoomStatus } from '../model/ScreenRoom.js'
import seatChema from '../validations/seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import ScreenRoom, { FULL } from '../model/ScreenRoom.js'
import { seatService } from '../services/Seat/index.js'

export async function checkAndUpdateScreen(screenId, statusRoom) {
  //...
  await ScreenRoom.updateOne(
    {
      _id: screenId
    },
    {
      status: statusRoom
    }
  )
}

export const getAll = async (req, res, next) => {
  try {
    const data = await seatService.getAllService(req)

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
    const data = await seatService.getOneService(req)

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
    const updateData = await seatService.updateService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      datas: updateData
    })
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const data = await seatService.createService(req)

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
    const data = await seatService.removeService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
