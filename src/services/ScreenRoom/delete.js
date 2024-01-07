/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { timeSlotService } from '../TimeSlot/index.js'
import Seat from '../../model/Seat.js'
import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import { SOLD, UNAVAILABLE, AVAILABLE } from '../../model/Seat.js'

export const removeService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await ScreeningRoom.findOneAndDelete({ _id: id })
    const data = await ScreeningRoom.paginate(
      { _id: id },
      {
        populate: {
          path: 'TimeSlotId',
          populate: 'SeatId'
        }
      }
    )
    const timeSlots = data.docs[0].TimeSlotId

    timeSlots.forEach((timeSlots) => {
      const isSeatSold = timeSlots.SeatId.some((seat) => seat.status === SOLD)
      if (isSeatSold) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Some seat is sold. Can not delete this screen'
        )
      }
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Cannot find screen with this id'
      )
    }
    let promises = [ScreeningRoom.deleteOne({ _id: id })]
    for (let i = 0; i < timeSlots.length; i++) {
      promises.push(timeSlotService.removeService(timeSlots[i]._id))
    }

    const result = await Promise.all(promises)

    if (!result && result.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete screening rooms failed!'
      )
    }

    return result
  } catch (error) {
    throw error
  }
}

export const deleteSoftService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    const body = reqBody.body
    const checkScreenRoom = await ScreeningRoom.paginate(
      { _id: id },
      { populate: 'SeatId' }
    )
    // Tìm kiếm trong screen rooom có seat nào có trong trạng thái SOLD không
    // Nếu không thì không cho xóa
    const isSold = checkScreenRoom.docs[0].SeatId.some((seat) => {
      return seat.status === SOLD
    })

    if (isSold) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Seat in this screen room is sold. Cant delete it!'
      )
    }
    const data = await ScreeningRoom.findOneAndUpdate({ _id: id }, body, {
      new: true
    })
    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete screening rooms failed!'
      )
    }

    const updateSeat = await Seat.updateMany(
      {
        _id: {
          $in: data.SeatId
        }
      },
      {
        status: UNAVAILABLE
      }
    )
    if (!updateSeat) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Update seat from rooms failed!'
      )
    }
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}
// export const deleteSoftService = async (reqBody) => {
//   try {
//     const id = reqBody.params.id
//     const body = reqBody.body
//     const checkScreenRoom = await ScreeningRoom.paginate(
//       { _id: id },
//       { populate: 'SeatId' }
//     )
//     // Tìm kiếm trong screen rooom có seat nào có trong trạng thái SOLD không
//     // Nếu không thì không cho xóa
//     const isSold = checkScreenRoom.docs[0].SeatId.some((seat) => {
//       return seat.status === SOLD
//     })

//     if (isSold) {
//       throw new ApiError(
//         StatusCodes.CONFLICT,
//         'Seat in this screen room is sold. Cant delete it!'
//       )
//     }
//     const data = await ScreeningRoom.findOneAndUpdate({ _id: id }, body, {
//       new: true
//     })
//     if (!data) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Delete screening rooms failed!'
//       )
//     }

//     const updateSeat = await Seat.updateMany(
//       {
//         _id: {
//           $in: data.SeatId
//         }
//       },
//       {
//         status: UNAVAILABLE
//       }
//     )
//     if (!updateSeat) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Update seat from rooms failed!'
//       )
//     }
//     return data
//   } catch (error) {
//     throw new Error(error.message)
//   }
// }

export const restoreService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    const body = reqBody.body
    const data = await ScreeningRoom.findOneAndUpdate({ _id: id }, body, {
      new: true
    })
    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Restore screening rooms failed!'
      )
    }

    const updateSeat = await Seat.updateMany(
      {
        _id: {
          $in: data.SeatId
        }
      },
      {
        status: AVAILABLE
      }
    )
    if (!updateSeat) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Update seat from rooms failed!'
      )
    }
    return data
  } catch (error) {
    throw error
  }
}
