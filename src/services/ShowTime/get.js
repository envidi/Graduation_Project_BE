/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import Showtimes from '../../model/Showtimes.js'
import ApiError from '../../utils/ApiError.js'
import { convertTimeToCurrentZone } from '../../utils/timeLib.js'

// export const getAllService = async (req) => {
//   try {
//     const {
//       _page = 1,
//       _limit = 10,
//       _sort = 'createdAt',
//       _order = 'asc',
//       ScreeningRoomId,
//     } = req.query
//     const options = {
//       page: _page,
//       limit: _limit,
//       sort: {
//         [_sort]: _order === 'asc' ? 1 : -1
//       }
//     }
//     const queryCondition = ScreeningRoomId ? { ScreeningRoomId } : {}
//     const data = await Showtimes.paginate({ destroy: false }, queryCondition, options)
//     if (!data || data.docs.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'No list show found!')
//     }
//     return data
//   } catch (error) {
//     throw error
//   }
// }
export const getAllService = async (req) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc',
      screenRoomId,
    } = req.query;

    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1,
      },
    };

    // Gộp các điều kiện truy vấn lại với nhau
    const queryCondition = {
      ...(screenRoomId && { screenRoomId }),
      destroy: false, // Đảm bảo tất cả các kết quả trả về đều không bị "destroy"
    };

    const data = await Showtimes.paginate(queryCondition, options);
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list show found!');
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllServiceByMovie = async (req) => {
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
    const data = await Showtimes.paginate(
      { destroy: false, _id: req.params.id, timeFrom: { $gt: new Date() } },
      options
    )
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list show found!')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const getOneService = async (req) => {
  try {
    const { id } = req.params
    const response = await Showtimes.paginate(
      { _id: id },
      {
        populate: {
          path: 'screenRoomId',
          select: 'name status'
        }
      }
    )
    const plainDocs = response.docs.map((doc) => doc.toObject())

    // Add the 'price' field to each movie based on the current day type
    plainDocs.forEach((showtime) => {
      showtime.timeFrom = convertTimeToCurrentZone(showtime.timeFrom)
      showtime.timeTo = convertTimeToCurrentZone(showtime.timeTo)
    })
    if (!response) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list Show found!')
    }
    return {
      ...response,
      docs: plainDocs
    }
  } catch (error) {
    throw error
  }
}

export const getAllIncludeDestroyService = async (reqBody) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = 'createdAt',
      _order = 'asc'
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    }
    const data = await Showtimes.paginate({ destroy: true }, options)
    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No screening rooms found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
