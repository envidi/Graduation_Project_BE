// import Product from '../models/Product.js';
import Movie from '../model/Movie.js'
import productSchema from '../validations/product.js'
import Category from '../model/Category.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/stringToSlug.js'

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
    const data = await Movie.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
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
    const data = await Movie.findById(id)
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movie found!')
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
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id movie not found')
    }
    const body = req.body
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Movie.findByIdAndUpdate(id, body, { new: true })
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update movie failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const body = req.body
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Movie.create({
      ...body,
      slug : slugify(body.name)
    })

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create movie failed!')
    }
    // Tạo ra mảng array của category
    const arrayCategory = data.categoryId
    // Tạo vòng lặp để thêm từng cái product id vào mỗi mảng product của category
    for (let i = 0; i < arrayCategory.length; i++) {
      await Category.findOneAndUpdate(arrayCategory[i], {
        $addToSet: {
          products: data._id
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

export const remove = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await Movie.findOneAndDelete({ _id: id })
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete movie failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
