import asyncHandler from 'express-async-handler'
import User from '../model/user.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import RoleUser from '../model/RoleUser.js'
import ApiError from '../utils/ApiError.js'
import { AccessTokenUser } from '../middleware/jwt.js'
import userValidate from '../validations/user.js'
import { sendMailController } from './email.js'
import { sendEmailPassword } from '../utils/sendMail.js'
import cloudinary from '../middleware/multer.js'

export const register = asyncHandler(async (req, res, next) => {
  const body = req.body

  const { error } = userValidate.validate(body, { abortEarly: true })

  if (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
  }
  if (body.password !== body.confirmPassword) {
    res.status(400).json({
      message: 'Password không khớp nhau , thử lại !!!'
    })
  }
  const user = await User.findOne({ email: body.email })
  if (user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email đã được đăng ký!')
  }
  const hashPassword = await bcrypt.hash(body.password, 10)
  const hashConfirmPassword = await bcrypt.hash(body.confirmPassword, 10)

  let avatarUrl
  if (req.file) {
    const cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
      folder: 'AVATAR',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    })
    avatarUrl = cloudGetUrl.secure_url
  } else {
    avatarUrl =
      'https://phongreviews.com/wp-content/uploads/2022/11/avatar-facebook-mac-dinh-19.jpg'
  }

  const response = await User.create({
    ...body,
    password: hashPassword,
    confirmPassword: hashConfirmPassword,
    avatar: avatarUrl
  })
  const newUser = await response.populate('roleIds', 'roleName')

  // thêm user vào bảng role user
  await RoleUser.findOneAndUpdate(
    { roleName: 'user' },
    { $push: { userIds: newUser._id } },
    { new: true }
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
  const response = await User.find({}).populate("roleIds","roleName")
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No users found!')
  }

  return res.status(StatusCodes.OK).json({
    message: 'Gọi danh sách users thành công',
    response
  })
})
export const getDetailUserById = asyncHandler(async (req, res) => {
  const {id} = req.params
  const response = await User.findById(id).populate("roleIds","roleName")
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No users found!')
  }

  return res.status(StatusCodes.OK).json({
    message: 'Gọi  users thành công',
    response
  })
})

export const getDetailUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const detailProduct = await User.findById(_id)
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
  const { _id, password, oldPassword } = req.user
  if (!_id || Object.keys(req.body).length === 0)
    throw new ApiError(StatusCodes.NOT_FOUND, 'Missing inputs')

  const body = req.body

  const { error } = userValidate.validate(body, { abortEarly: true })

  if (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
  }
  if (body.password !== body.confirmPassword) {
    res.status(400).json({
      message: 'Password không khớp nhau , thử lại !!!'
    })
  }

  // kiểm tra password cũ có đúng khoong

  // const user = await User.findById(_id);
  // if (!user) {
  //   throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  // }
  // const hashedOldPassword = user.password;

  // const isPasswordCorrect = await bcrypt.compare(body.oldPassword, hashedOldPassword)
  // if(!isPasswordCorrect) {
  //   throw new ApiError(StatusCodes.BAD_REQUEST, "Password không chính xác ")
  // }

  let avatarUrl
  let cloudGetUrl
  if (req.file) {
    cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
      folder: 'AVATAR',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    })
    avatarUrl = cloudGetUrl.secure_url
  } else {
    avatarUrl =
      'https://phongreviews.com/wp-content/uploads/2022/11/avatar-facebook-mac-dinh-19.jpg'
  }

  const hashPassword = await bcrypt.hash(body.password, 10)
  const hashConfirmPassword = await bcrypt.hash(body.confirmPassword, 10)

  const newProfile = {
    ...body,
    password: hashPassword,
    confirmPassword: hashConfirmPassword,
    ...(cloudGetUrl && { avatar: avatarUrl })
  }

  const response = await User.findByIdAndUpdate(_id, newProfile, { new: true })
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Update user failed!')
  }

  return res.status(StatusCodes.OK).json({
    message: 'Update user thành công',
    response
  })
})
export const updateClient = asyncHandler(async (req, res) => {
  const { _id, password, oldPassword } = req.user

  const body = req.body

  let avatarUrl
  let cloudGetUrl
  if (req.file) {
    cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
      folder: 'AVATAR',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    })
    avatarUrl = cloudGetUrl.secure_url
  } else {
    avatarUrl =
      'https://phongreviews.com/wp-content/uploads/2022/11/avatar-facebook-mac-dinh-19.jpg'
  }

  const newProfile = {
    ...body,

    ...(cloudGetUrl && { avatar: avatarUrl })
  }

  const response = await User.findByIdAndUpdate(_id, newProfile, { new: true })
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

  if (!infoUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found!')
  }

  const { name, email, mobile, address, password, roleIds } = req.body

  let newRoleId = null
  if (roleIds) {
    const roleId = await RoleUser.findById(roleIds)
    newRoleId = roleId?._id
  }

  const updateUser = {
    name,
    email,
    mobile,
    address,
    password,
    roleIds: newRoleId
  }

  const response = await User.findByIdAndUpdate(id, updateUser, { new: true })
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found!')
  }

  if (newRoleId !== infoUser.roleIds) {
    await RoleUser.findOneAndUpdate(
      { userIds: infoUser._id },
      { $pull: { userIds: infoUser._id } },
      { new: true }
    )
  }
  if (newRoleId) {
    await RoleUser.findOneAndUpdate(
      newRoleId,
      { $addToSet: { userIds: infoUser._id } },
      { new: true }
    )
  }

  return res.status(200).json({
    message: 'Update user thành công',
    response
  })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.query
  if (!email) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Missing inputs')
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }
  const resetToken = await user.changePasswordToken()

  await user.save()

  const html = `Copy token sau để thay đổi mật khẩu : ${resetToken} `

  const data = {
    email: email,
    html
  }

  const response = await sendEmailPassword(data)
  return res.status(200).json({
    message: 'Gửi mail thành công',
    response
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body
  if (!password && !token) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Missing inputs')
  }

  const hashPassword = await bcrypt.hash(password, 10)

  const passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() }
  })
  if (!user) throw new Error('Token không đúng hoặc đã hết hạn')
  user.password = hashPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  user.passwordChangedAt = Date.now()
  await user.save()

  return res.status(StatusCodes.OK).json({
    success: user ? true : false,
    message: user ? 'Update password success' : ' Something wrongs'
  })
})
