import asyncHandler from 'express-async-handler'
import User from '../model/user.js'
import bcrypt from 'bcrypt'
// import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import RoleUser from "../model/RoleUser.js"
import ApiError from '../utils/ApiError.js'
import { AccessTokenUser } from '../middleware/jwt.js'
import userValidate from '../validations/user.js'

export const register = asyncHandler(async (req, res) => {
  
  const body = req.body

  const { error } = userValidate.validate(body, { abortEarly: true })

  if (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
  }
  const user = await User.findOne({ email: body.email })
  if (user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email đã được đăng ký!')
  }
  const hashPassword = await bcrypt.hash(body.password, 10)
  const response = await User.create({
    ...body,
    password: hashPassword
  })

  const newUser = await response.populate("roleIds", "roleName")

  // thêm user vào bảng role user
  await RoleUser.findOneAndUpdate(
    {roleName : "user"},
    {$push : {userIds : newUser._id}},
    {new: true}
  )
  
  return res.status(200).json({
    message: newUser ? 'Đăng kí thành công' : 'Đăng kí thất bại',
    newUser
  })
})

export const login = asyncHandler(async (req, res) => {
  const body = req.body

  const response = await User.findOne({ email: body.email })
  if (!response) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ' Email chưa đăng ký!')
  }
  const isMatch = await bcrypt.compare(body.password, response.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Password not match!')
  }

  if (response && isMatch) {
    // const { password, role, refreshToken, ...userData } = response.toObject()
    const { roleIds, ...userData } = response.toObject()
    // AccessToken dùng để xác thực người dùng, phân quyền
    const Accesstoken = AccessTokenUser(response._id, roleIds)

    await User.findByIdAndUpdate(response._id, { new: true })
    return res.status(200).json({
      message: 'đăng nhập thành công',
      Accesstoken,
      userData
    })
  }
})

export const getAllUser = asyncHandler(async (req, res) => {
  const response = await User.find({})
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No users found!')
  }

  return res.status(StatusCodes.OK).json({
    message: 'Gọi danh sách users thành công',
    response
  })
})

export const getDetailUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const detailProduct = await User.findById(id)
  if (!detailProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found!')
  }
  return res.status(StatusCodes.OK).json({
    success: detailProduct ? 'Gọi user thành công' : false,
    message: detailProduct ? detailProduct : 'Gọi user thất bại'
  })
})

export const deleteUser = async (req, res, next) => {
  try {
    const response = await User.findByIdAndDelete(req.params.id)
    if (!response) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete user failed!')
    }

    return res.status(200).json({
      message: 'Xóa user thành công',
      response
    })
  } catch (error) {
    next(error)
  }
}

export const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  if (!_id || Object.keys(req.body).length === 0)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Missing inputs')

  const body = req.body

  const { error } = userValidate.validate(body, { abortEarly: true })

  if (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
  }
  const response = await User.findByIdAndUpdate(_id, body, { new: true })
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Update user failed!')
  }

  return res.status(StatusCodes.OK).json({
    message: 'Update user thành công',
    response
  })
})

export const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!id || Object.keys(req.body).length === 0)
  throw new ApiError(StatusCodes.NOT_FOUND, 'Missing inputs')

  const infoUser = await User.findById(id)

  if(!infoUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found!');
  }

  const {name, email, mobile,address , password, roleIds} = req.body

  let newRoleId = null;
  if(roleIds){
    const roleId = await RoleUser.findById(roleIds)
    newRoleId = roleId?._id
  }

  const updateUser = {
    name,
     email,
      mobile,
      address ,
       password,
      roleIds:  newRoleId
  }
   

  const response = await User.findByIdAndUpdate(id, updateUser, { new: true })
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found!')
  }
  
  if(newRoleId !== infoUser.roleIds) {
    await RoleUser.findOneAndUpdate(
      { userIds: infoUser._id },
      { $pull : {userIds : infoUser._id} },
      { new: true }
    );
    
  }
  if(newRoleId){
    await RoleUser.findOneAndUpdate(
      newRoleId,
      { $addToSet : {userIds : infoUser._id} },
      { new: true }
    );
  }
   


  return res.status(200).json({
    message: 'Update user thành công',
    response
  })
})