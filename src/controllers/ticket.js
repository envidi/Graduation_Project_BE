import { StatusCodes } from 'http-status-codes'
import { ticketService } from '../services/Ticket/index'

export const getAll = async (req, res, next) => {
  try {
    const data = await ticketService.getAllService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    const data = await ticketService.getOneService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}
export const create = async (req, res, next) => {
  try {
    const data = await ticketService.createService(req)
    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}

// export const create = async (req, res, next) => {
//     try {
//         const body = req.body;
//         const { error } = ticketValidateSchema.validate(body, { abortEarly: true });
//         if (error) {
//             throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message);
//         }

//         // Giả sử `prices` chứa ID của giá vé và `foods` chứa mảng ID của thức ăn

//         // Lấy giá vé từ bảng giá vé
//         const moviePriceDocument = await MoviePrice.findById(body.prices);
//         if (!moviePriceDocument) {
//             throw new ApiError(StatusCodes.NOT_FOUND, 'Movie price not found!');
//         }
//         const moviePrice = moviePriceDocument.price;

//         // Lấy giá của các món ăn từ bảng thức ăn
//         const foodDocuments = await Food.find({ '_id': { $in: body.foods } });
//         if (!foodDocuments || foodDocuments.length === 0) {
//             throw new ApiError(StatusCodes.NOT_FOUND, 'Food items not found');
//         }
//         const totalFoodPrice = foodDocuments.reduce((sum, doc) => sum + doc.price, 0);

//         // Tính tổng giá cuối cùng
//         const totalPrice = moviePrice + totalFoodPrice;

//         // Tạo ticket mới với thông tin cần thiết và tổng giá
//         const ticket = new Ticket({
//             ...body,
//             totalPrice // Thêm tổng giá vào document
//         });

//         const data = await ticket.save();

//         if (!data) {
//             throw new ApiError(StatusCodes.NOT_FOUND, 'Create ticket failed!');
//         }

//         return res.status(StatusCodes.CREATED).json({
//             message: 'Success',
//             data: data
//         });
//     } catch (error) {
//         next(error);
//     }
// };

export const update = async (req, res, next) => {
  try {
    const data = await ticketService.updateService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Ticket updated successfully', // Thành công
      data: data
    })
  } catch (error) {
    next(error)
  }
}

export const checkoutPaymentSeat = async (req, res, next) => {
  try {
    const updateData = await ticketService.updatePaymentTicketService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      datas: updateData
    })
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const data = await ticketService.removeService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Ticket removed successfully',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const removeHard = async (req, res, next) => {
  try {
    const data = await ticketService.removeHardService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Ticket removed successfully',
      data
    })
  } catch (error) {
    next(error)
  }
}
