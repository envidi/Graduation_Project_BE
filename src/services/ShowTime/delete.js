/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
// import Seat from '../../model/Seat.js'
// import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
// import { SOLD, UNAVAILABLE, AVAILABLE } from '../../model/Seat.js'
// import TimeSlot from '../../model/TimeSlot.js'
import Showtimes from '../../model/Showtimes.js'
import { timeSlotService } from '../TimeSlot/index.js'
import Movie from '../../model/Movie.js'

export const removeService = async (req) => {
  try {
    const { id } = req.params

    // check xem có ai đặt ghê chưa
    const response = await Showtimes.findById(id)
    if (!response) {
      throw new ApiError(StatusCodes.NOT_FOUND, ' Show not found!')
    }

    const timeSlot = await timeSlotService.getTimeSlotIdWithScreenRoomId({
      showTimeId: response._id,
      screenRoomId: response.screenRoomId
    })

    if (!timeSlot || Object.keys(timeSlot).length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'This showtime dont have a timeslot in this room'
      )
    }
    const deleteTimeSlot = await timeSlotService.removeService(timeSlot._id)
    if (!deleteTimeSlot || deleteTimeSlot.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete timeslot failed when delete show'
      )
    }
    try {
      await Promise.all([
        Showtimes.deleteOne({ _id: id }),
        Movie.updateOne(
          {
            _id: response.movieId
          },
          {
            $pull: {
              showTimes: response._id
            }
          }
        )
      ])
    } catch (error) {
      throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
    }

    return response
  } catch (error) {
    throw error
  }
}
export const deleteShowTime = async (id) => {
  try {
    const deleteShow = await Showtimes.findByIdAndDelete(id)
    if (!deleteShow || Object.keys(deleteShow).length === 0) {
      throw new ApiError(StatusCodes.CONFLICT, 'Delete show failed')
    }
    return deleteShow
  } catch (error) {
    throw error
  }
}
export const deleteSoftService = async (req) => {
  try {
    const id = req.params.id

    // const body = reqBody.body
    const updateShowTime = await Showtimes.findByIdAndUpdate(
      id,
      { destroy: true },
      { new: true }
    )
    if (!updateShowTime || Object.keys(updateShowTime).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete soft showtime failed')
    }
    await timeSlotService.deleteSoftService(id)

    return updateShowTime
  } catch (error) {
    throw new Error(error.message)
  }
}

// Ngược lại cái so với delete soft
export const restoreService = async (req) => {
  try {
    const id = req.params.id

    // const body = reqBody.body
    const updateShowTime = await Showtimes.findByIdAndUpdate(
      id,
      { destroy: false },
      { new: true }
    )
    if (!updateShowTime || Object.keys(updateShowTime).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete soft showtime failed')
    }
    await timeSlotService.restoreService(id)

    return updateShowTime
  } catch (error) {
    throw new Error(error.message)
  }
}
