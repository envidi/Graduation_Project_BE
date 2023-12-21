// import Product from '../models/Product.js';
import Movie from '../model/Movie.js'
import productSchema from '../validations/product.js'
import Category from '../model/Category.js'
import { StatusCodes } from 'http-status-codes'

export const getAll = async (req, res) => {
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
      throw new Error('No product found!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message
    })
  }
}

export const getDetail = async (req, res) => {
  try {
    const id = req.params.id
    const data = await Movie.findById(id)
    if (!data) {
      throw new Error('Failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message
    })
  }
}

export const update = async (req, res) => {
  try {
    const id = req.params.id
    const body = req.body
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.details[0].message
      })
    }
    const data = await Movie.findByIdAndUpdate(id, body, { new: true })
    if (!data) {
      throw new Error('Failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      datas: data
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

export const create = async (req, res) => {
  try {
    const body = req.body
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.details[0].message
      })
    }
    const data = await Movie.create(body)
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

    if (!data) {
      throw new Error('Failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message
    })
  }
}

export const remove = async (req, res) => {
  try {
    const id = req.params.id
    const data = await Movie.findOneAndDelete({ _id: id })
    if (!data) {
      throw new Error('Failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message
    })
  }
}
