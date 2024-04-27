import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import ApiError from '../utils/ApiError'
import { StatusCodes } from 'http-status-codes'

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
      if (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'inValid accesstoken')
      }

      req.user = decode
      next()
    })
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn chưa xác thực tài khoản')
  }
})
export const verifyAccessPaymentToken = asyncHandler(async (req, res, next) => {
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
      if (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token '
        })
      }

      req.payment = decode
      next()
    })
  } else {
    return res.status(401).json({
      success: false,
      message: 'Required authen'
    })
  }
})
// đặt isAdmin sau hàm verify thì sẽ dùng đươc req.user của hàm trên
export const isAdmin = asyncHandler(async (req, res, next) => {
  const { roleIds } = req.user
  if (roleIds !== '659b79c6757ca91b82e2b9d0')
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không phải Admin')
  next()
})
