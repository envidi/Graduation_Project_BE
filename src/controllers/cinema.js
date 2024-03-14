import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import CinemaValidate from '../validations/cinema.js'
import Cinema from '../model/Cinema.js'

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
    const data = await Cinema.paginate({}, options)

    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Cinema found!')
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
    const id = req.params.id;

    const data = await Cinema.findById(id)
    if (!data || data.length === 0) {

      throw new ApiError(StatusCodes.NOT_FOUND, 'Not Cinema found!')
    }

    return res.status(StatusCodes.OK).json({
      data:
        data

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
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id Cinema not found')
    }
    const { error } = CinemaValidate.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Cinema.findByIdAndUpdate(id, body, { new: true })
    if (!data) throw new ApiError(StatusCodes.NOT_FOUND, 'Update Cinema failed!')
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const body = req.body
    const { error } = CinemaValidate.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Cinema.create(
      body
    )
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create Cinema failed')
    }
    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await Cinema.findByIdAndDelete(id)
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete Cinema failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
