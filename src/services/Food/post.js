/* eslint-disable no-useless-catch */
import Food from '../../model/Food'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError'
import foodValidationSchema from '../../validations/food'

export const createService = async (reqBody) => {
  try {
    const body = reqBody.body
    //thêm đường dẫn ảnh vòa body
    if (reqBody.file) {
      body.image = reqBody.file.path;
    }
    console.log(body);

    const { error } = foodValidationSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Food.create({
      ...body
    })
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create food failed!')
    }
    return data
  } catch (error) {
    throw error
  }
}
