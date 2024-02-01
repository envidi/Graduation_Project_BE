// import Movie from '../model/Movie.js'
// import movieSchema from '../validations/movie.js'
// import Category from '../model/Category.js'
// import { StatusCodes } from 'http-status-codes'
// import ApiError from '../utils/ApiError.js'
// import { slugify } from '../utils/stringToSlug.js'
// import findDifferentElements from '../utils/findDifferent.js'
// import { moviePriceService } from '../services/moviePrice.js'
// import Showtimes from '../model/Showtimes.js'

import { StatusCodes } from 'http-status-codes'
import Movie from '../../model/Movie.js'
import movieSchema from '../../validations/movie.js'
// import {
//   convertTimeToCurrentZone,
//   convertTimeToIsoString
// } from '../utils/timeLib.js'
import ApiError from '../../utils/ApiError.js'
import Category from '../../model/Category.js'
import { convertTimeToIsoString } from '../../utils/timeLib.js'
// import { get } from 'mongoose'



export const createService = async (req) => {
    try {

      const body = req.body
      // đẩy ảnh
    //   const result = await cloudinary.uploader.upload(file.path)

      // Lưu URL của ảnh từ Cloudinary vào cơ sở dữ liệu
    //   body.image = result.secure_url
    //   if (req.file) {
    //     body.image = req.file.path;
    //   }
 
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
  
      data._doc = {
        ...data._doc,
        prices: prices.map((price) => {
          return {
            ...price,
            movieId: data._id
          }
        })
      }
      return data
    //   return res.status(StatusCodes.OK).json({
    //     message: 'Success',
    //     datas: data
    //   })
    } catch (error) {
    throw error
    }
  }