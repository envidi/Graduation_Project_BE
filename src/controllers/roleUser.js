import { StatusCodes } from 'http-status-codes'
import RoleUser from '../model/RoleUser'
import ApiError from '../utils/ApiError.js'
import roleUserValidate from '../validations/roleUser.js'
import User from '../model/user.js'
// Thêm vai trò mới
// async function createRole(roleName, status, userIds) {
//   const role = new RoleUser({ roleName, status, userIds });
//   await role.save();
//   return role;
// }

export const createRole = async (req, res, next) => {
  try {
    const { roleName, status, userIds } = req.body

    // Xác thực dữ liệu đầu vào
    const validationResult = roleUserValidate.validate({
      roleName,
      status,
      userIds
    })
    if (validationResult.error) {
      const errorMessage = validationResult.error.details
        .map((err) => err.message)
        .join(', ')
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage)
    }

    const role = new RoleUser({ roleName, status })

    // Lấy danh sách ID người dùng từ mảng userIds hiện tại của RoleUser
    const existingUserIds = role.userIds || []

    // Kiểm tra xem ID người dùng mới đã tồn tại trong danh sách hay chưa
    if (!existingUserIds.includes(userIds)) {
      // Thêm ID người dùng mới vào mảng userIds
      role.userIds = [...existingUserIds, ...userIds]
    }

    await role.save()

    res.status(StatusCodes.OK).json(role)
  } catch (error) {
    next(error)
  }
}
// Lấy thông tin của vai trò
// async function getRole(roleId) {
//   const role = await RoleUser.findById(roleId);
//   return role;
// }
export const getRole = async (req, res, next) => {
  try {
    const roleId = req.params.id // Lấy roleId từ yêu cầu

    const role = await RoleUser.findById(roleId) // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId

    if (!roleId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id role user not found')
    }
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id role user not found')
    }

    res.status(StatusCodes.OK).json(role) // Trả về kết quả thành công dưới dạng JSON
  } catch (error) {
    next(error)
  }
}
// Cập nhật vai trò
//b1
// async function updateRole(roleId, updates) {
//   const role = await RoleUser.findByIdAndUpdate(roleId, updates, { new: true });
//   return role;
// }

///b2
export const updateRole = async (req, res, next) => {
  try {
    const roleId = req.params.id
    const updates = req.body
    if (!roleId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id role user not found')
    }
    // Xác thực thông tin cập nhật
    const validationResult = roleUserValidate.validate(updates)
    if (validationResult.error) {
      const errorMessage = validationResult.error.details
        .map((err) => err.message)
        .join(', ')
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage)
    }

    const role = await RoleUser.findByIdAndUpdate(roleId, updates, {
      new: true
    })


    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id role user not found')
    }
    res.status(StatusCodes.OK).json(role)
  } catch (error) {
    next(error)
  }
}

// Xóa vai trò

//b1
// async function deleteRole(roleId) {
//   await RoleUser.findByIdAndDelete(roleId);
// }

// b2
export const deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.id // Lấy roleId từ yêu cầu
    if (!roleId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id role user not found')
    }
    const role = await RoleUser.findById(roleId) // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId

    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Role user not found')
    }

    if (role.roleName === 'user') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'This role user is not allowed to delete')
    }

    // Kiểm tra xem vai trò đang được xóa có tên là "khách hàng" hay không
    // Nếu có, thực hiện việc chuyển đổi các user đang là vai trò đó sang vai trò "khách hàng"
    if (role.roleName !== 'user') {
      // Lấy danh sách userIds của vai trò đang được xóa
      const userIds = role.userIds

      // Tìm và cập nhật các user có userIds đúng với danh sách userIds của vai trò đang được xóa
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { role: 'user' } }
      )
    }

    await RoleUser.findByIdAndDelete(roleId) // Xóa vai trò trong cơ sở dữ liệu dựa trên roleId

    res.status(StatusCodes.OK).json({ message: 'Xóa vai trò thành công.' }) // Trả về kết quả thành công dưới dạng JSON
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
