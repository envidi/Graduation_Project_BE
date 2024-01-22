/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import Seat from '../../model/Seat.js'
import TimeSlot from '../../model/TimeSlot.js'
import ApiError from '../../utils/ApiError.js'
import { SOLD, UNAVAILABLE, AVAILABLE } from '../../model/Seat.js'
import ScreenRoom from '../../model/ScreenRoom.js'

export const removeService = async (timeSlotId) => {
  try {
    const id = timeSlotId
    // const data = await ScreeningRoom.findOneAndDelete({ _id: id })
    const data = await TimeSlot.findOne({ _id: id }).populate('SeatId')
    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Cannot find timeslot with this id'
      )
    }
    // Nếu như một số ghế trong timeslot có trạng thái là SOLD
    // thì ko cho tiếp tục
    const isSeatSold = data.SeatId.some((seat) => seat.status === SOLD)
    if (isSeatSold) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This seat in this timeslot has already sold!'
      )
    }
    let promises = [TimeSlot.deleteOne({ _id: data._id })]
    // Xóa timeslot hiện tại khỏi mảng TimeSlotId trong model screenroom
    if (data.ScreenRoomId) {
      promises.push(
        ScreenRoom.updateOne(
          { _id: data.ScreenRoomId },
          {
            $pull: {
              TimeSlotId: data._id
            }
          }
        )
      )
    }
    // Xóa hết tất cả ghế có timeslotid hiện tại
    if (data.SeatId || data.SeatId.length > 0) {
      promises.push(
        Seat.deleteMany({
          _id: {
            $in: data.SeatId
          }
        })
      )
    }
    const result = await Promise.all(promises)

    return result
  } catch (error) {
    throw error
  }
}

// export const deleteSoftService = async (reqBody) => {
//   try {
//     const id = reqBody.params.id
//     const body = reqBody.body
//     const checkTimeSlot = await TimeSlot.paginate(
//       { _id: id },
//       { populate: 'SeatId' }
//     )
//     // Nếu như một số ghế trong timeslot có trạng thái là SOLD
//     // thì ko cho tiếp tục
//     const isSold = checkTimeSlot.docs[0].SeatId.some((seat) => {
//       return seat.status === SOLD
//     })

//     if (isSold) {
//       throw new ApiError(
//         StatusCodes.CONFLICT,
//         'Seat in this screen room is sold. Cant delete it!'
//       )
//     }
//     const data = await TimeSlot.findOneAndUpdate({ _id: id }, body, {
//       new: true
//     })

//     if (!data) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Delete screening rooms failed!'
//       )
//     }
//     // Cập nhất tất cả ghế của timeslot hiện tại thành UNAVAILABLE
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
//     throw error
//   }
// }
// Ngược lại delete soft
export const restoreService = async (id) => {
  try {
    const data = await TimeSlot.findOneAndUpdate({ Show_scheduleId: id }, { destroy : false }, {
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

export const deleteSoftService = async (showTimeId) => {
  try {
    const id = showTimeId

    const data = await TimeSlot.findOneAndUpdate({ Show_scheduleId: id }, { destroy : true }, {
      new: true
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete soft timeslot failed'
      )
    }
    // Cập nhất tất cả ghế của timeslot hiện tại thành UNAVAILABLE
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
    throw error
  }
}
