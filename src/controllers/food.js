// import Food from '../model/Food'
// import foodValidationSchema from '../validations/food'
// import { StatusCodes } from 'http-status-codes'
// import ApiError from '../utils/ApiError.js'
// // import findDifferentElements from '../utils/findDifferent.js'
// import { v2 as cloudinary } from 'cloudinary';

// // const checkImageExists = async (imageUrl) => {
// //   try {
// //     // Kiểm tra từ Cloudinary dựa trên URL của ảnh
// //     // Giả sử imageUrl là public ID của ảnh trên Cloudinary
// //     const result = await cloudinary.api.resource(imageUrl)
// //     return result ? true : false
// //   } catch (error) {
// //     // ảnh ko tồn tại hoặc lỗi trả về false
// //     return false
// //   }
// // }

// // const checkImagesForFoodArray = async (foodArray) => {
// //   for (let food of foodArray) {
// //     const imageExists = await checkImageExists(food.image)
// //     if (!imageExists) {
// //       food.image = null
// //     }
// //   }
// // }
// export const getAll = async (req, res, next) => {
//   try {
//     const {
//       _page = 1,
//       _limit = 10,
//       _sort = 'createdAt',
//       _order = 'asc',
//       includeDeleted // Thêm tham số này để kiểm tra query parameter
//     } = req.query; // Sử dụng req.query thay vì req.body để nhận tham số từ query string

//     const queryCondition = includeDeleted === 'true' ? {} : { isDeleted: false }

//     const options = {
//       page: _page,
//       limit: _limit,
//       sort: {
//         [_sort]: _order === 'asc' ? 1 : -1
//       }
//     }
//     // const data = await Food.paginate({}, options)
//     // const data = await Food.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
//     const data = await Food.paginate(queryCondition, options);

//     if (!data || data.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'No food found!')
//     }
//     // Kiểm tra hình ảnh tồn tại cho từng đối tượng trong mảng
//     // await checkImagesForFoodArray(data.docs);
//     return res.status(StatusCodes.OK).json({
//       message: 'Success',
//       data: data
//     })

//   } catch (error) {
//     next(error)
//   }
// }

// export const getDetail = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     // const data = await Food.findById(id)
//     // const data = await Food.findOne({ _id: id, isDeleted: false }); // Kiểm tra thêm điều kiện không bị xóa mềm
//     const { includeDeleted } = req.query // lấy tham số includeDeleted từ query string
//     const queryCondition = includeDeleted === 'true' ? { _id: id } : { _id: id, isDeleted: false };
//     const data = await Food.findOne(queryCondition)
//     if (!data || data.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Not food found!')
//     }
//     // check ảnh trên Cloudinary
//     // const imageExists = await checkImageExists(data.$getPopulatedDocs.image)
//     // if (!imageExists) {
//     //   // data.image = null
//     //   throw new ApiError(StatusCodes.NOT_FOUND, 'Image not found!')
//     // }
//     /////////////////////////////////
//     return res.status(StatusCodes.OK).json({
//       message: 'Success',
//       data: data
//     })
//   } catch (error) {
//     next(error)
//   }
// }

// export const create = async (req, res, next) => {
//   try {
//     const body = req.body
//     //thêm đường dẫn ảnh vòa body
//     if (req.file) {
//       body.image = req.file.path;
//     }
//     console.log(body);

//     const { error } = foodValidationSchema.validate(body, { abortEarly: true })
//     if (error) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
//     }
//     const data = await Food.create({
//       ...body
//     })
//     if (!data) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Create food failed!')
//     }
//     return res.status(StatusCodes.CREATED).json({
//       message: 'Success',
//       data: data
//     })
//   } catch (error) {
//     next(error)
//   }
// }

// export const update = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     const body = req.body

//     // Thêm đường dẫn ảnh vào body
//     if (req.file) {
//       body.image = req.file.path;
//     }

//     if (!id) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'Id Food not found')
//     }

//     const { error } = foodValidationSchema.validate(body, { abortEarly: true })
//     if (error) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, error.details[0].message)
//     }

//     // Kiểm tra xem thực phẩm có bị xóa mềm không trước khi cập nhật
//     const existingFood = await Food.findOne({ _id: id, isDeleted: false });
//     if (!existingFood) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Food not found or has been deleted!')
//     }

//     // Thực hiện cập nhật
//     const data = await Food.findByIdAndUpdate(id, body, { new: true });
//     if (!data) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Update Food failed!')
//     }

//     return res.status(StatusCodes.OK).json({
//       message: 'Success!',
//       data: data
//     })
//   } catch (error) {
//     next(error)
//   }
// }

// export const remove = async (req, res, next) => {
//   try {
//     const id = req.params.id
//     // const data = await Food.findByIdAndDelete(id)

//     // Cập nhật trường isDeleted thành true thay vì xóa bản ghi
//     const data = await Food.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
//     if (!data) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'Food not found or already deleted!')
//     }
//     return res.status(StatusCodes.OK).json({
//       message: 'Food has been soft deleted!',
//       data: data
//     })
//   } catch (error) {
//     next(error)
//   }
// }

import { foodService } from '../services/Food/index'
import { StatusCodes } from 'http-status-codes'

export const getAll = async (req, res, next) => {
  try {
    const data = await foodService.getAllService(req)
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      datas: data
    })
  } catch (error) {
    next(error)
  }
}

export const getDetail = async (req, res, next) => {
  try {
    const data = await foodService.getOneService(req)

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
    const updateData = await foodService.updateService(req)

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
    const data = await foodService.createService(req)

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
    const data = await foodService.removeService(req)

    return res.status(StatusCodes.OK).json({
      message: 'Success!',
      data
    })
  } catch (error) {
    next(error)
  }
}
