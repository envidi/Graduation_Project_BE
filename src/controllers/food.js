import Food from '../model/Food'
import foodSchema from '../validations/food'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
// import findDifferentElements from '../utils/findDifferent.js'
export const getAll = async (req, res, next) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = req.body
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    const data = await Food.paginate({}, options)
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No food found!')
    }

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })

  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await Food.findById(id)
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not food found!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const body = req.body
    const { error } = foodSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Food.create({
      ...body
    })
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create food failed!')
    }
    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
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
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id Food not found')
    }
    const { error } = foodSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Food.findByIdAndUpdate(id, body, { new: true })
    if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Update Food failed!')
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data: data
    })
  } catch (error) {
    next(error)
  }
}


export const remove = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await Food.findByIdAndDelete(id)
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete food failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data: data
    })
  } catch (error) {
    next(error)
  }
}