import Movie from '../model/Movie.js'
import movieSchema from '../validations/movie.js'
import Category from '../model/Category.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/stringToSlug.js'
import findDifferentElements from '../utils/findDifferent.js'
import { moviePriceService } from '../services/moviePrice.js'

import {
  convertTimeToCurrentZone,
  convertTimeToIsoString
} from '../utils/timeLib.js'

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
      populate: 'prices'
    }
    const data = await Movie.paginate({}, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movies found!')
    }
    // Convert Mongoose documents to plain JavaScript objects
    const plainDocs = data.docs.map((doc) => doc.toObject())

    const currentDate = new Date()
    const currentDay = currentDate.getDay() // Sunday is 0, Monday is 1, ..., Saturday is 6

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((movie) => {
      const priceObject = movie.prices.find((price) => {
        return currentDay >= 1 && currentDay <= 5
          ? price.dayType === 'weekday'
          : price.dayType === 'weekend'
      })

      movie.price = priceObject ? priceObject.price : null
    })

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: {
        ...data,
        docs: plainDocs
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await Movie.findById(id)
    const test = convertTimeToCurrentZone(data.fromDate)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng movie
    // const data = await Movie.aggregate([
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
    const newData = {
      ...data._doc,
      fromDate: convertTimeToCurrentZone(data.fromDate),
      toDate: convertTimeToCurrentZone(data.toDate)
    }
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No movie found!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: newData
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
    const { error } = movieSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // const data = await Movie.findByIdAndUpdate(id, body, { new: true })
    const data = await Movie.findById(id, 'categoryId')

    const result = findDifferentElements(data.categoryId, body.categoryId)
    // Những id category mới thêm mảng categoryId của movie
    const newCategory = result.filter((cate) => {
      if (body.categoryId.includes(cate)) {
        return cate
      }
    })
    // Những id category bị xóa khỏi mảng categoryId của movie
    const deletedCategoryfromProduct = findDifferentElements(
      newCategory,
      result
    )
    const updateData = await Movie.updateOne({ _id: id }, body)

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update movie failed!')
    }
    if (newCategory && newCategory.length > 0) {
      await Category.updateMany(
        {
          _id: {
            // tìm ra tất cả những id trong mảng dùng $in
            $in: newCategory
          }
        },
        {
          // Thêm productId vào products trong category nếu có rồi thì ko thêm , chưa có thì mới thêm dùng $addToSet
          $addToSet: {
            products: id
          }
        }
      )
    }
    if (deletedCategoryfromProduct && deletedCategoryfromProduct.length > 0) {
      await Category.updateMany(
        {
          _id: {
            // tìm ra tất cả những id trong mảng dùng $in
            $in: deletedCategoryfromProduct
          }
        },
        {
          // Xóa productId khỏi products trong category thì dùng $pull
          $pull: {
            products: id
          }
        }
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

export const create = async (req, res, next) => {
  try {
    const body = req.body
    const { error } = movieSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }

    const data = await Movie.create({
      ...body,
      fromDate: new Date(convertTimeToIsoString(body.fromDate)),
      toDate: new Date(convertTimeToIsoString(body.toDate)),
      slug: slugify(body.name)
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

    // get all price of movie
    const prices = data.prices
    //loop and delete all price of movie

    for (let i = 0; i < prices.length; i++) {
      await moviePriceService.remove(prices[i])
    }

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
