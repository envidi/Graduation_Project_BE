import { StatusCodes } from 'http-status-codes'
import RoleUser from '../model/RoleUser'
import ApiError from '../utils/ApiError.js'
import roleUserValidate from '../validations/roleUser.js'
import User from '../model/user.js'
import findDifferentElements from '../utils/findDifferent.js'
// Thêm vai trò mới

export const createRole = async (req, res, next) => {
  try {
    const body = req.body

    // Xác thực dữ liệu đầu vào
    const { error } = roleUserValidate.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }

    if (data.roleName === 'admin') {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'The role "admin" already exists'
      )
    }
    const data = await RoleUser.create({
      ...body
    })

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Role creation failed')
    }
    const roleId = data._id
    const userIds = data.userIds || []
    const usersWithRoleId = await User.find({ roleIds: roleId })

    if (usersWithRoleId.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The role has already been assigned to some users'
      )
    }
    const updatedUsers = await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { roleIds: roleId } },
      { new: true }
    )

    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}
// Lấy thông tin của vai trò

export const getRole = async (req, res, next) => {
  try {
    const roleId = req.params.id // Lấy roleId từ yêu cầu

    const role = await RoleUser.findById(roleId) // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId

    if (!roleId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id userRole not found')
    }
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id userRole not found')
    }

    res.status(StatusCodes.OK).json(role) // Trả về kết quả thành công dưới dạng JSON
  } catch (error) {
    next(error)
  }
}
// Cập nhật vai trò

export const updateRole = async (req, res, next) => {
  try {
    const roleId = req.params.id
    const updates = req.body

    // Xác thực thông tin cập nhật
    const validationResult = roleUserValidate.validate(updates)
    if (validationResult.error) {
      const errorMessage = validationResult.error.details
        .map((err) => err.message)
        .join(', ')
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        new Error(errorMessage).message
      )
    }

    // Lấy vai trò hiện tại từ cơ sở dữ liệu
    const roleUser = await RoleUser.findOneAndUpdate(
      { _id: roleId },
      { $set: { userIds: updates.userIds } },
      { new: true, fields: { userIds: 1 } }
    )

    if (!roleUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Role does not exist')
    }

    // Thêm vai trò vào trường roleIds của tài liệu người dùng nếu chưa tồn tại
    if (roleUser.userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: roleUser.userIds } },
        { $set: { roleIds: roleId } }
      )
    }

    // Xóa vai trò khỏi trường roleIds của tài liệu người dùng
    const deletedRolesFromRoleUser = roleUser.userIds.filter(
      (user) => !updates.userIds.includes(user)
    )
    if (deletedRolesFromRoleUser.length > 0) {
      await User.updateMany(
        { _id: { $in: deletedRolesFromRoleUser } },
        { $set: { roleIds: roleId } }
      )
    }

    res.status(StatusCodes.OK).json({
      message: 'Success',
      data: roleUser
    })
  } catch (error) {
    next(error)
  }
}

// Xóa vai trò

//b1
// async function deleteRole(roleId) {
//   await RoleUser.findByIdAndDelete(roleId);
// }

export const deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.id // Lấy roleId từ yêu cầu
    const id = '65984c549f4041a641e8dec3'

    // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId
    const roleUser = await RoleUser.findById(roleId)
    if (!roleUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User role ID not found')
    }
    if (roleUser.roleName === 'user') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete role "user"')
    }
    if (roleUser.roleName === 'admin') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete role "admin"')
    }

    // Lấy danh sách userIds của vai trò đang được xóa
    const userIds = roleUser.userIds

    // Tìm và cập nhật các user có userIds đúng với danh sách userIds của vai trò đang được xóa
    await User.updateMany({ _id: { $in: userIds } }, { $set: { roleIds: id } })

    // Xóa vai trò trong cơ sở dữ liệu dựa trên roleId
    await RoleUser.findByIdAndDelete(roleId)

    res.status(StatusCodes.OK).json({ message: 'Success', data: roleUser }) // Trả về kết quả thành công dưới dạng JSON
  } catch (error) {
    next(error)
  }
}

// Sử dụng các phương thức CRUD theo dạng liên tục
// createRole('Admin', 'Active', ['userId1', 'userId2'])
//   .then(createdRole => {
//     console.log('Vai trò mới:', createdRole);
//     return getRole(createdRole._id);
//   })
//   .then(role => {
//     console.log('Thông tin vai trò:', role);
//     return updateRole(role._id, { status: 'Inactive' });
//   })
//   .then(updatedRole => {
//     console.log('Vai trò đã cập nhật:', updatedRole);
//     return deleteRole(updatedRole._id);
//   })
//   .then(() => {
//     console.log('Vai trò đã được xóa.');
//   })
//   .catch(error => {
//     console.error('Lỗi:', error);
//   });
