import ScreeningRoom, { AVAILABLE } from '../model/ScreenRoom.js'
import ScreeningRoomSchema from '../validations/screenRoom.js'
import Category from '../model/Category.js'
import Seat, { SOLD } from '../model/Seat.js'

import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/stringToSlug.js'
import { StatusCodes } from 'http-status-codes'
import findDifferentElements from '../utils/findDifferent.js'
import { UNAVAILABLE } from '../model/Seat.js'

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
      },
      populate: {
        path: 'SeatId',
        select: 'ScreeningRoomId typeSeat'
      }
    }
    const data = await ScreeningRoom.paginate({ destroy: false }, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}
export const getAllInCludeDestroy = async (req, res, next) => {
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
      },
      populate: {
        path: 'SeatId',
        select: 'ScreeningRoomId typeSeat'
      }
    }
    const data = await ScreeningRoom.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
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
    const data = await ScreeningRoom.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng ScreeningRoom
    // const data = await ScreeningRoom.aggregate([
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
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
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
    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Screening rooms id not found')
    }
    const body = req.body
    const { error } = ScreeningRoomSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // const data = await ScreeningRoom.findByIdAndUpdate(id, body, { new: true })
    const data = await ScreeningRoom.findById(id, 'categoryId')

    const updateData = await ScreeningRoom.updateOne({ _id: id }, body)

    if (!updateData) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Update screening rooms failed!'
      )
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      datas: updateData
    })
  } catch (error) {
    next(error)
  }
}

export const createForPostMan = async (req, res, next) => {
  try {
    const body = req.body

    const isExistSeat = await Seat.find({
      _id: {
        $in: body.SeatId
      }
    })
    const hasScreenRoom = isExistSeat.filter((seat) => {
      return seat.ScreeningRoomId == undefined
    })
    if (!isExistSeat || isExistSeat.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Seat id is not found')
    }
    if (hasScreenRoom.length == 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Seat is in different screen room'
      )
    }

    const { error } = ScreeningRoomSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await ScreeningRoom.create({
      ...body,
      slug: slugify(body.name)
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Create screening rooms failed!'
      )
    }
    const arraySeat = data.SeatId
    // Tạo vòng lặp để thêm từng cái product id vào mỗi mảng product của category
    for (let i = 0; i < arraySeat.length; i++) {
      await Seat.findOneAndUpdate(arraySeat[i], {
        $set: {
          ScreeningRoomId: data._id
        }
      })
    }

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const createForFe = async (req, res, next) => {
  try {
    const body = req.body
    const rowCount = 5
    const columnCount = 5

    const { error } = ScreeningRoomSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await ScreeningRoom.create({
      ...body,
      slug: slugify(body.name)
    })

    if (!data) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Create screening rooms failed!'
      )
    }
    // Thêm 25 ghế vào room hiện tại
    for (let row = 1; row <= rowCount; row++) {
      for (let column = 1; column <= columnCount; column++) {
        let seatTypeToUse = 'VIP'
        let priceSeat = 120
        // Check if the seat is in the middle (assuming rowCount and columnCount are odd)
        if (
          row === 1 ||
          row === rowCount ||
          column === 1 ||
          column === columnCount
        ) {
          seatTypeToUse = 'normal'
          priceSeat = 100
        }

        // Add the new seat with seat type

        const dataSeat = await Seat.create({
          ScreeningRoomId: data._id,
          row,
          column,
          typeSeat: seatTypeToUse,
          price: priceSeat
        })
        await ScreeningRoom.findByIdAndUpdate(
          data._id,
          {
            $addToSet: { SeatId: dataSeat._id }
          },
          { new: true }
        )
      }
    }

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const deleteSoft = async (req, res, next) => {
  try {
    const id = req.params.id
    const body = req.body
    const checkScreenRoom = await ScreeningRoom.paginate({ _id: id }, { populate: 'SeatId' })

    const isSold = checkScreenRoom.docs[0].SeatId.some((seat) => {
      // console.log(seat.status)
      return seat.status === SOLD
    })
    // console.log(isSold)
    if (isSold) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Some seat in this screen room is sold!'
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
    const id = req.params.id
    const body = req.body
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
    const id = req.params.id
    const data = await ScreeningRoom.findOneAndDelete({ _id: id })
    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Delete screening rooms failed!'
      )
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
