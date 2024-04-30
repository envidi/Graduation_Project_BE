/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'

import movieSchema from '../../validations/movie.js'
import Movie from '../../model/Movie.js'
import Showtimes from '../../model/Showtimes.js'
import Category from '../../model/Category.js'
import { convertTimeToIsoString } from '../../utils/timeLib.js'
import findDifferentElements from '../../utils/findDifferent.js'
import { moviePriceService } from '../moviePrice.js'
import cloudinary from '../../middleware/multer.js'

export const updateService = async (req) => {
  try {
    const id = req.params.id
    const body = req.body
    body.prices = JSON.parse(body.prices)
    let imageUrl
    let cloudGetUrl
    const { error } = movieSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const checkmovie = await Movie.findById(id)
    if (!checkmovie || checkmovie.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Phim không tồn tại')
    }
    if (req.file) {
      cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
        folder: 'AVATAR',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      })
      imageUrl = cloudGetUrl.secure_url
    } else {
      imageUrl = body.image
    }
    // let imageUrl
    // let cloudGetUrl
    // if (req.file) {
    //   cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
    //     folder: 'AVATAR',
    //     allowed_formats: ['jpg', 'png', 'jpeg'],
    //     transformation: [{ width: 500, height: 500, crop: 'limit' }]
    //   })
    //   imageUrl = cloudGetUrl.secure_url
    // } else {
    //   imageUrl = checkmovie.image
    // }

    // check suat chieu nếu có thì k sửa dc
    const checkshowtimes = await Showtimes.find({ movieId: id })
    const showtime = await checkshowtimes[0]
    
    // if (showtime != undefined) {
    //   // if (checkmovie.duration != req.body.duration) {
    //   //   throw new ApiError(StatusCodes.NOT_FOUND, 'Phim đang xuất chiếu không thể sửa duration !')
    //   // }
    //   throw new ApiError(
    //     StatusCodes.NOT_FOUND,
    //     'Movies that are currently playing cannot be Update!'
    //   )
    // }

    // check status nếu đang công chiếu thì k sửa dc 1 số trường

    // if (checkmovie.status == 'IS_SHOWING') {
    //   // if (checkmovie.duration != req.body.duration) {
    //   //   throw new ApiError(StatusCodes.NOT_FOUND, 'Phim đang công chiếu không thể sửa duration !')
    //   // }
    //   throw new ApiError(
    //     StatusCodes.NOT_FOUND,
    //     'Movies currently being released cannot be edited !'
    //   )
    // }

    // check destroy nếu đang xóa mềm thì không thể sửa được bất cứ trường nào
    if (checkmovie.destroy) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Bộ phim này đã bị xóa mềm không thể sửa!'
      )
    }

    // const data = await Movie.findByIdAndUpdate(id, body, { new: true })
    const data = await Movie.findById(id, 'categoryId prices')

    const { prices, ...reqbody } = body

    const updateData = await Movie.updateOne(
      { _id: id },
      {
        ...reqbody,
        ...(cloudGetUrl && { image: imageUrl }),
        // fromDate: new Date(convertTimeToIsoString(body.fromDate)),
        // toDate: new Date(convertTimeToIsoString(body.toDate))
      }
    )

    // update giá
    if (prices && prices.length > 0) {
      for (let i = 0; i < data.prices.length; i++) {
        await moviePriceService.updatePrice({
          _id: data.prices[i]._id,
          price: prices[i].price
        })
      }
    }

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update movie failed!')
    }

    if (body?.categoryId && body.categoryId.length > 0) {
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
    }

    return updateData
  } catch (error) {
    throw error
  }
}
