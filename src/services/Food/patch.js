/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import Food from '../../model/Food.js'
import foodValidationSchema from '../../validations/food.js'
export const updateService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    const body = reqBody.body

    // Thêm đường dẫn ảnh vào body
    if (reqBody.file) {
      body.image = reqBody.file.path;
    }

    // if (!id) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, 'Id Food not found')
    // }

    const { error } = foodValidationSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.details[0].message)
    }

    // // Kiểm tra xem thực phẩm có bị xóa mềm không trước khi cập nhật
    // const existingFood = await Food.findOne({ _id: id, isDeleted: false });
    // if (!existingFood) {
    //   throw new ApiError(StatusCodes.NOT_FOUND, 'Food not found or has been deleted!')
    // }

    // Thực hiện cập nhật
    const data = await Food.findByIdAndUpdate(id, body, { new: true });
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update Food failed!')
    }

    return data
  } catch (error) {
    throw error
  }
}