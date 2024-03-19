/* eslint-disable no-useless-catch */

import { StatusCodes } from 'http-status-codes'
import Movie from '../../model/Movie.js'
import movieSchema from '../../validations/movie.js'
import ApiError from '../../utils/ApiError.js'
import Category from '../../model/Category.js'
import { convertTimeToIsoString } from '../../utils/timeLib.js'
import { slugify } from '../../utils/stringToSlug.js'
import { moviePriceService } from '../moviePrice.js'

export const createService = async (req) => {
  try {
    const body = req.body
    // thêm đường dẫn ảnh vào body
    if (req.file) {
      body.image = req.file.path
    }

    const { error } = movieSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }

    const { prices, ...restBody } = body

    const data = await Movie.create({
      ...restBody,
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

    // Tạo giá
    if (prices && prices.length > 0) {
      for (let i = 0; i < prices.length; i++) {
        await moviePriceService.create({
          movieId: data._id.toString(),
          ...prices[i]
        })
      }
    }

    return data
  } catch (error) {
    throw error
  }
}
