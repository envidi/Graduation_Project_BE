import Movie from '../model/Movie.js'
import MoviePrice from '../model/MoviePrice.js'
import Seat from '../model/Seat.js'
import { moviePriceService } from '../services/moviePrice.js'
import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/stringToSlug.js'
import {
  moviePriceSchema,
  updateMoviePriceSchema
} from '../validations/MoviePrice.js'
import { StatusCodes } from 'http-status-codes'

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
    const data = await MoviePrice.paginate({}, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(404, 'No MoviePrice found!')
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
    const id = req.params.id
    const data = await MoviePrice.findById(id)
    if (!data || data.length === 0)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not MoviePrice found!')
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
    const body = req.body
    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id MoviePrice not found')
    }
    const { error } = updateMoviePriceSchema.validate(body, {
      abortEarly: true
    })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const updateData = await MoviePrice.findByIdAndUpdate({ _id: id }, body)

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update MoviePrice failed!')
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
      ...body,
      slug: slugify(body.name)
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
    const id = req.params.id;
    const moviePrice = await moviePriceService.findById(id);

    if (!moviePrice) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'MoviePrice not found!');
    }
    const movie = await Movie.findById(movcóiePrice.movieId);

    if(movie.status === 'COMING_SOON' || movie.status === 'HOT') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Movie is not released yet!');
    }
     
     // Kiểm tra xem có chỗ nào được đặt trước cho bộ phim không
     const seatBookings = await Seat.find({ movie: moviePrice.movieId, seats: { $exists: true, $not: {$size: 0} } }).exec(); // Giả sử việc đặt chỗ có mảng 'chỗ ngồi'
     if (seatBookings.length > 0) {
       throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete price as there are seat bookings for this movie.');
     }
    
    await moviePriceService.remove(id);

    // Cập nhật mảng giá trong Movie bằng cách loại bỏ giá đã xóa
    const updatedMovie = await Movie.findByIdAndUpdate(
      moviePrice.movie,
      { $set: { prices: moviePrice._id } }, // Giả sử Movie có một mảng prices chứa các ID của MoviePrice
      { new: [] } // Trả về Movie đã được cập nhật
    );

    return res.status(StatusCodes.OK).json({
      message: 'MoviePrice deleted successfully!',
      movie: updatedMovie
    });
  } catch (error) {
    next(error);
  }
};