import { StatusCodes } from 'http-status-codes'
import RoleUser from '../model/RoleUser'
import ApiError from '../utils/ApiError.js'
import roleUserValidate from '../validations/roleUser.js'
import User from '../model/user.js'
// Thêm vai trò mới

export const createRole = async (req, res, next) => {
  try {
    const body = req.body
    const { error } = roleUserValidate.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const roleNameUser = await RoleUser.findOne({ roleName: 'admin' })
    // kiểm tra nó đã tồn tại admin hay chưa
    if (roleNameUser && Object.keys(roleNameUser).length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This role "admin" has already in database'
      )
    }
    const data = await RoleUser.create({
      ...body
    })
    // kiểm tra data nó đã tồn tại hay chưa
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Role creation failed')
    }

    const roleId = data._id
    const userIds = data.userIds || []
    const usersWithRoleId = await User.find({ roleIds: roleId })
    // kiểm tra roleids nó có tồn tại hay không
    if (usersWithRoleId.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The role has already been assigned to some users'
      )
    }
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { roleIds: roleId } },
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

    // Lấy vai trò hiện tại từ cơ sở dữ liệu
    const roleUser = await RoleUser.findByIdAndUpdate(
      roleId,
      { userIds: updates.userIds },
      { new: true, fields: { userIds: 1 } }
    )

    if (!roleUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Role does not exist')
    }

    // Thêm vai trò vào trường roleIds của tài liệu người dùng nếu chưa tồn tại
    if (roleUser.userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: roleUser.userIds } },
        { $addToSet: { roleIds: roleId } }
      )
    }

    // Xóa vai trò khỏi trường roleIds của tài liệu người dùng
    const deletedRolesFromRoleUser = roleUser.userIds.filter(
      (user) => !updates.userIds.includes(user)
    )
    if (deletedRolesFromRoleUser.length > 0) {
      await User.updateMany(
        { _id: { $in: deletedRolesFromRoleUser } },
        { $pull: { roleIds: roleId } }
      )
    }

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: roleUser
    })
  } catch (error) {
    next(error)
  }
}

// Xóa vai trò

export const deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.id // Lấy roleId từ yêu cầu
    const roleNameUser = await RoleUser.findOne({ roleName: 'user' })
    //
    if (!roleNameUser && roleNameUser.length === 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This role is not exist in database'
      )
    }
    const id = roleNameUser._id
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

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Success', data: roleUser })
  } catch (error) {
    next(error)
  }
}

export const getAll = async (req, res, next) => {
  try {
    const roles = await RoleUser.find() // Lấy tất cả các vai trò từ cơ sở dữ liệu

    res.status(StatusCodes.OK).json(roles) // Trả về danh sách vai trò dưới dạng JSON
  } catch (error) {
    next(error)
  }
}

// export const addUserToRole = async (req, res, next) => {
//   try {
//   const roleId = req.params.id; // Lấy roleId từ yêu cầu
//   const userId = req.body.userId; // Lấy userId từ yêu cầu

//   // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId
//   const roleUser = await RoleUser.findById(roleId);
//   if (!roleUser) {
//   throw new ApiError(StatusCodes.NOT_FOUND, 'User role ID not found');
//   }

//   // Lấy danh sách userIds hiện tại của vai trò
//   const userIds = roleUser.userIds;

//   // Kiểm tra xem userId đã tồn tại trong danh sách userIds hay chưa
//   if (userIds.includes(userId)) {
//          throw ApiError(StatusCodes.BAD_REQUEST, 'User ID already exists in the role');
//   }

//   // Thêm userId mới vào mảng userIds
//   userIds.push(userId);

//   // Cập nhật vai trò với danh sách userIds đã cập nhật
//   await RoleUser.findByIdAndUpdate(roleId, { userIds });

//   // Thêm roleId vào mảng roleIds của người dùng
//   await User.updateMany(
//   { _id: userId },
//   { $addToSet: { roleIds: roleId } }
//   );

//   res.status(StatusCodes.OK).json({ message: 'Success', data: roleUser });
//   catch (error) {
//   console.error('Error:', error);
//   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while adding user to the role.' });
//   }
//   };
