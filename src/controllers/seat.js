// import Product from '../models/Product.js';
import { StatusCodes } from 'http-status-codes'

import { seatService } from '../services/Seat/index.js'
import TimeSlot from '../model/TimeSlot.js'

export async function checkAndUpdateTimeSlot(timeSlotId, statusTimeSlot) {
  //...
  await TimeSlot.updateOne(
    {
      _id: timeSlotId
    },
    {
      status: statusTimeSlot
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
