// import Product from '../models/Product.js';
import { StatusCodes } from 'http-status-codes'

import { seatService } from '../services/Seat/index.js'
import TimeSlot from '../model/TimeSlot.js'
import { FULL_TIMESLOT, AVAILABLE_TIMESLOT } from '../model/TimeSlot.js'
import { FULL_SCREEN, AVAILABLE_SCREEN } from '../model/ScreenRoom.js'
import { screenRoomService } from '../services/ScreenRoom/index.js'
import ApiError from '../utils/ApiError.js'
// Nếu như tất cả timeslot có trạng thái là full thì screen room chứa
// tất cả các timeslot đó sẽ chuyển sang status là full
// Nếu như có một timeslot có trạng thái là available thì screen room chứa
// tất cả các timeslot đó sẽ chuyển sang status là available
export async function checkAndUpdateTimeSlot(
  timeSlotId,
  statusTimeSlot,
  screenRoomId
) {
  //...
  const allTimeSlot = await TimeSlot.find(
    { ScreenRoomId: screenRoomId },
    'status'
  )
  const isStatusTimeSlotFull = allTimeSlot.every((timeSlot) => {
    return (
      timeSlot._id.toString() == timeSlotId.toString() ||
      timeSlot.status === FULL_TIMESLOT
    )
  })
  const lastUpdateTimeSlot = await TimeSlot.findByIdAndUpdate(
    timeSlotId,
    {
      status: statusTimeSlot
    },
    { new: true }
  )
  if (!lastUpdateTimeSlot || Object.keys(lastUpdateTimeSlot).length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Update timeslot failed when update status seat'
    )
  }
  let promises = []
  // Nếu tất cả timeslot có trạng thái là full thì sẽ chuyển
  // trạng thái screen room sang full
  if (isStatusTimeSlotFull) {
    promises.push(
      screenRoomService.updateStatusScreen(screenRoomId, {
        status: FULL_SCREEN
      })
    )
  }
  // Nếu như timeslot vừa cập nhật có status là available
  // và trước khi cập nhật có status tất cả timeslot có status
  // là full thì sau khi cập nhật lại trạng thái của phòng chiếu
  // available
  if (lastUpdateTimeSlot.status === AVAILABLE_TIMESLOT) {
    const isTimeSlotAvailable = allTimeSlot.every(
      (timeslot) => timeslot.status === FULL_TIMESLOT
    )
    if (isTimeSlotAvailable) {
      promises.push(
        screenRoomService.updateStatusScreen(screenRoomId, {
          status: AVAILABLE_SCREEN
        })
      )
    }
  }
  await Promise.all(promises).catch((error) => {
    throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error.message))
  })
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
export const getAllByShowTime = async (req, res, next) => {
  try {
    const data = await seatService.getAllServiceByShowTime(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}
export const getSeatByShowTime = async (req, res, next) => {
  try {
    const data = await seatService.getSeatByShowTime(req)

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
