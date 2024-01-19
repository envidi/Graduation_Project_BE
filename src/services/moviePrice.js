import { StatusCodes } from 'http-status-codes'
import MoviePrice from '../model/MoviePrice'
import ApiError from '../utils/ApiError'
import { moviePriceSchema } from '../validations/MoviePrice'
import slugify from 'slugify'
import Movie from '../model/Movie'

export const moviePriceService = {
  remove: async (id) => {
    const data = await MoviePrice.findByIdAndDelete(id)

    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete MoviePrice failed!')
    }
    return data
  },
  create: async (body) => {
    const { error } = moviePriceSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }

    // Check if a MoviePrice with the same movieId and dayType already exists
    const existingMoviePrice = await MoviePrice.findOne({
      movieId: body.movieId,
      dayType: body.dayType
    })
    if (existingMoviePrice) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'A MoviePrice with the same movieId and dayType already exists'
      )
    }

    const data = await MoviePrice.create({
      ...body
    })
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create MoviePrice failed')
    }
    // Update movie prices in movie collection
    await Movie.findOneAndUpdate(data.movieId, {
      $addToSet: {
        prices: data._id
      }
    })

    return data
  }
}
