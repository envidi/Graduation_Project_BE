/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import ScreeningRoomSchema from '../../validations/screenRoom.js'
import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'


export const updateService = async (reqBody) => {
  try {
    const body = reqBody.body
    const id = reqBody.params.id
    if (!id) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Screening rooms id not found')
    }
    const { error } = ScreeningRoomSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // const data = await ScreeningRoom.findByIdAndUpdate(id, body, { new: true })
    // const data = await ScreeningRoom.findById(id, 'categoryId')

    const updateData = await ScreeningRoom.updateOne({ _id: id }, body)

    if (!updateData) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Update screening rooms failed!'
      )
    }
    return updateData
  } catch (error) {
    throw error
  }
}