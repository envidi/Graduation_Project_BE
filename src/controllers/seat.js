// import Product from '../models/Product.js';
import Seat, { UNAVAILABLE } from '../model/Seat.js'
import seatChema from '../validations/seat.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import ScreenRoom from '../model/ScreenRoom.js'

export const getAll = async (req, res, next) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = req.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    const data = await Seat.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No seats found!')
    }
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
    const id = req.params.id
    const data = await Seat.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng Seat
    // const data = await Seat.aggregate([
    //   {
    //     $match : {
    //       _id : new mongoose.Types.ObjectId(id)
    //     }
    //   },
    //   {
    //     $lookup : {
    //       from : 'categories',
    //       localField : 'categoryId',
    //       foreignField : '_id',
    //       as : 'categoryCol'
    //     }
    //   },
    //   {
    //     $project : {
    //       name : 1,
    //       author : 1,
    //       categoryCol : 1
    //     }
    //   }

    // ])
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No seat found!')
    }
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
    const id = req.params.id
    const body = req.body

    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Seat id not found')
    }
    const { error } = seatChema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // const data = await Seat.findByIdAndUpdate(id, body, { new: true })
    const data = await Seat.findById(id)
    const dataScreen = await ScreenRoom.findById(
      data.ScreeningRoomId,
      'destroy'
    )

    if (dataScreen.destroy === true && data.status === UNAVAILABLE) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This seat is unavailable to edit'
      )
    }

    const updateData = await Seat.updateOne(
      { _id: id },
      { $set: { status: body.status } }
    )

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update seat failed!')
    }
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
    const body = req.body
    const ScreenId = body.ScreeningRoomId
    const isScreenRoomExist = await ScreenRoom.findById(ScreenId)
    if (!isScreenRoomExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Screen room id is not found')
    }
    const { error } = seatChema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // Tìm xem dữ liệu của ghế đã có trong database tại một rạp đã có chưa
    // Nếu chưa thì thêm vào , nếu có rồi thì báo lỗi , nếu như khác rạp phim thì vẫn thêm được
    const isExistSeat = await Seat.find({
      $and: [
        {
          row: body.row
        },
        {
          column: body.column
        },
        {
          ScreeningRoomId: body.ScreeningRoomId
        }
      ]
    })
    if (isExistSeat && isExistSeat.length > 0) {
      throw new ApiError(StatusCodes.CONFLICT, 'Seat is already in use')
    }

    const data = await Seat.create({
      ...body
    })

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create seat failed!')
    }

    const updateScreenHaveSeatId = await ScreenRoom.findByIdAndUpdate(
      ScreenId,
      {
        $addToSet: { SeatId: data._id }
      },
      { new: true }
    )
    if (!updateScreenHaveSeatId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Update screen room have seat failed!'
      )
    }

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
    const id = req.params.id

    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Seat id is not found!')
    }
    const data = await Seat.findOneAndDelete({ _id: id })
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete seat failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
