// import Product from '../models/Product.js';
import Category from '../model/Category.js'
import ApiError from '../utils/ApiError.js'
import categorySchema from '../validations/category.js'
import { StatusCodes } from 'http-status-codes'

// const handleErrorResponse = (res, error) => {
//   return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//     message: error.message
//   })
// }

export const getAll = async (req, res, next) => {
  try {
    // const categoryId = req.params.id;
    const { id: categoryId } = req.params
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
    const data = await Category.paginate({ categoryId }, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No categories found!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data.docs
    })
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    // const categoryId = req.query.id;
    const { id: categoryId } = req.query
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      _embed
    } = req.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    const populateOptions = _embed ? { path: 'products', select: 'name' } : []
    const data = await Category.findOne({ _id: categoryId })
    if (!data || data.length === 0)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not category found!')
    const result = await Category.paginate(
      { _id: categoryId },
      { ...options, populate: populateOptions }
    )
    if (!result && result.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not category found!')
    }
    if (_embed) {
      return res.status(StatusCodes.OK).json({
        data: {
          categoryId,
          products: result.docs
        }
      })
    } else {
      return res.status(StatusCodes.OK).json({
        data: result.docs
      })
    }
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const id = req.params.id
    const body = req.body

    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id category not found')
    }
    const { error } = categorySchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Category.findByIdAndUpdate(id, body, { new: true })
    if (!data) throw new Error('Update category failed!')
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
    const { error } = categorySchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Category.create(body)
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create category failed')
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
    const data = await Category.findByIdAndDelete(id)
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete category failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
