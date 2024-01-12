import Showtimes from '../model/Showtimes.js'
import Movie from '../model/Movie.js'
import ScreeningRoom from '../model/ScreenRoom.js'


import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/stringToSlug.js'
import { StatusCodes } from 'http-status-codes'
import findDifferentElements from '../utils/findDifferent.js'
import showtimesValidate from '../validations/showtimes.js'
export const AVAILABLE = 'Available'
export const ISCOMING = 'IsComming'
export const statusScreen = [AVAILABLE, ISCOMING]
export const createShowTime = async (req, res, next) => {
    try {
      const body = req.body;
  
      // Kiểm tra validate của dữ liệu đầu vào
      const { error } = showtimesValidate.validate(body, { abortEarly: true });
      if (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message);
      }
  
      // Kiểm tra tồn tại của movieId và screenRoomId
      const movieExists = await Movie.findById(req.body.movieId);
      const screenRoomExists = await ScreeningRoom.findById(req.body.screenRoomId);
  
      if (!movieExists || !screenRoomExists) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "movieId hoặc screenRoomId không hợp lệ");
      }
  
      // Tạo lịch chiếu phim
      const data = await Showtimes.create(body);
  
      await ScreeningRoom.findByIdAndUpdate(req.body.screenRoomId, {
        $push : {showTimes : data._id}
      })
      await Movie.findByIdAndUpdate(req.body.movieId, {
        $push : {showTimes : data._id}
      })
      return res.status(StatusCodes.OK).json({
        message: "Tạo lịch chiếu thành công",
        data,
      });
    } catch (error) {
      console.error(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Đã xảy ra lỗi trong quá trình xử lý",
      });
    }
  };
  
  export const getAllShow = async (req, res) => {
    try {
      const response = await Showtimes.find({})
    if (!response || response.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list Show found!')
    }
  
    return res.status(StatusCodes.OK).json({
      message: 'Gọi danh sách lịch chiếu thành công',
      response
    })
    } catch (error) {
      next(error)
    }
    
  }
  
  export const getDetailShow = async (req, res) => {
    try {
      const {id} = req.params
    const response = await Showtimes.findById(id)
    if (!response ) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No list Show found!')
    }
    const checkSeatInScreenRoom = ScreeningRoom.find({})
    console.log("check seat" , checkSeatInScreenRoom);
    return res.status(StatusCodes.OK).json({
      message: 'Gọi  lịch chiếu thành công',
      response
    })
    } catch (error) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message : "Không tìm thấy lịch chiếu "
      })
    }
    
  }

    export const deleteShow = async (req, res) => {
      try {
        const {id} = req.params
      
        // check xem có ai đặt ghê chưa
        const checkSeatInScreenRoom = await ScreeningRoom.findOne({SeatId : {$exists : true }})
        console.log(" check ghe", checkSeatInScreenRoom);
        if(checkSeatInScreenRoom) {
          return res.status(400).json({
            message:"Không thể xóa vì screenRoom đã có người đặt ghế rồi !!!"
          })
        }
        const response = await Showtimes.findByIdAndDelete(id)
        if (!response ) {
          throw new ApiError(StatusCodes.NOT_FOUND, ' Show not found!')
        }
        return res.status(StatusCodes.OK).json({
          message: 'Xóa  lịch chiếu thành công',
          response
        })
      } catch (error) {
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message || 'Internal Server Error'
        });
      }
    
    }
  

export const updateShowTime = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    const show = await Showtimes.findById(id);
    
    if (!show) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch chiếu không tồn tại");
    }

    // Kiểm tra validate của dữ liệu đầu vào
    const { error } = showtimesValidate.validate(body, { abortEarly: true });
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }

    // Kiểm tra tồn tại của movieId và screenRoomId
    const movieExists = await Movie.findById(req.body.movieId);
    const screenRoomExists = await ScreeningRoom.findById(req.body.screenRoomId);

    if (!movieExists || !screenRoomExists) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "movieId hoặc screenRoomId không hợp lệ");
    }

    // Update lịch chiếu phim
    const data = await Showtimes.findByIdAndUpdate(id, body, { new: true });

    // Update showTimes in Movie
    if (show.movieId.toString() !== req.body.movieId) {
      // Remove from the previous movie
      await Movie.findByIdAndUpdate(show.movieId, { $pull: { showTimes: show._id } });

      // Add to the new movie
      await Movie.findByIdAndUpdate(req.body.movieId, { $addToSet: { showTimes: show._id } });
    }

    // Update showTimes in ScreeningRoom
    await ScreeningRoom.findByIdAndUpdate(req.body.screenRoomId, {
      $push: { showTimes: data._id },
    });

    // Ensure that the updated showTimes array is retrieved
    const updatedShow = await Showtimes.findById(id);

    return res.status(StatusCodes.OK).json({
      message: "Cập nhật lịch chiếu thành công",
      data: updatedShow,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Đã xảy ra lỗi trong quá trình xử lý",
    });
  }
};

  