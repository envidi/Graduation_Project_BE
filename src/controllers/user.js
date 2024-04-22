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
  try {
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
    // const hashConfirmPassword = await bcrypt.hash(body.confirmPassword, 10)

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
      // confirmPassword: hashConfirmPassword,
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
  } catch (error) {
    next(error)
  }
})
export const registerGoogle = asyncHandler(async (req, res, next) => {
  try {
    const body = req.body

    const user = await User.findOne({ email: body.email })
    if (user) {
      const isMatch = await bcrypt.compare(body.password, user.password)
      if (!isMatch) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Mật khẩu không đúng hoặc bạn đã dùng email này để đăng kí !'
        )
      }
      const { roleIds, ...userData } = user.toObject()
      // AccessToken dùng để xác thực người dùng, phân quyền
      const Accesstoken = AccessTokenUser(user._id, roleIds)
      return res.status(200).json({
        message: 'đăng nhập thành công',
        Accesstoken,
        userData
      })
    }
    const hashPassword = await bcrypt.hash(body.password, 10)

    const response = await User.create({
      name: body.name,
      email: body.email,
      password: hashPassword,
      confirmPassword: hashPassword,
      avatar: body.avatar
    })

    const newUser = await response.populate('roleIds', 'roleName')

    // thêm user vào bảng role user
    const [, responseRegister] = await Promise.all([
      RoleUser.findOneAndUpdate(
        { roleName: 'user' },
        { $push: { userIds: newUser._id } },
        { new: true }
      ),
      User.findOne({ email: body.email })
    ])

    const Accesstoken = AccessTokenUser(response._id, responseRegister.roleIds)

    return res.status(200).json({
      message: newUser ? 'Đăng kí thành công' : 'Đăng kí thất bại',
      Accesstoken,
      newUser
    })
  } catch (error) {
    next(error)
  }
})
export const totalCountUser = asyncHandler(async (req, res, next) => {
  try {

    const countUser = await User.countDocuments({})
    if (!countUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No user found')
    }

    return res.status(200).json({
      message: countUser ? 'Lấy tổng số người dùng thành công' : 'Lấy tổng số người dùng thất bại',
      countUser
    })
  } catch (error) {
    next(error)
  }
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
  const response = await User.find({}).populate("roleIds", "roleName")
  if (!response || response.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No users found!')
  }

  

  return res.status(StatusCodes.OK).json({
    message: 'Gọi danh sách users thành công',
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

export const getDetailUserById = asyncHandler(async (req, res) => {
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
  const { email } = req.body
  if (!email) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Missing inputs')
  }

  const user = await User.findOne({ email }).select('-confirmPassword')
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

  //  const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex")

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  }).select('-confirmPassword')
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


const mongoose = require('mongoose');

export const blocked = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Không có user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra xem người dùng có phải là admin không
    if (user.roleIds && user.roleIds.toString() === "659b79c6757ca91b82e2b9d0") {
      return res.status(400).json({ message: "Không thể block admin" });
    }else{
  // Nếu không phải là admin, cập nhật trạng thái và lưu lại người dùng
  const update = { isBlocked: true, status: "Blocked" }

  const newUser =  await User.findByIdAndUpdate(id, update, { new: true });
  // console.log("check block user",user);
  

  return res.status(200).json({ message: "User blocked successfully", newUser });
    }

  

  } catch (error) {
    next(error);
  }
}



export const unBlock = async(req, res, next) => {
  try {
    const { id } = req.params;
    const update = { isBlocked: false, status: "Active" }

    const user = await User.findByIdAndUpdate(id,update, {new:true} );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Unblock user successfully", user });

  } catch (error) {
    next(error)

  }
}

