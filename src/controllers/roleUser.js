import { StatusCodes } from 'http-status-codes';
import RoleUser from '../model/RoleUser'
import ApiError from '../utils/ApiError.js'
import roleUserValidate from '../validations/roleUser.js';
import User from '../model/user.js';
// Thêm vai trò mới


export const createRole = async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = roleUserValidate.validate(body, { abortEarly: true });
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message);
    }

    const roleNameAdmin = await RoleUser.find({ roleName: 'admin' })
    // kiểm tra nó đã tồn tại admin hay chưa
    if (body.roleName ==='admin'&&roleNameAdmin && Object.keys(roleNameAdmin).length >0) {
      throw new ApiError(StatusCodes.CONFLICT, 'This role "admin" is not exist in database')
    }

    const roleNameUser = await RoleUser.find({ roleName: 'user' })
    // kiểm tra nó đã tồn tại user hay chưa
    if (body.roleName ==='user'&&roleNameUser && Object.keys(roleNameUser).length >0) {
      throw new ApiError(StatusCodes.CONFLICT, 'This role "user" is not exist in database')
    }
    const roleNameQuanLi = await RoleUser.find({ roleName: 'manager' })
    // kiểm tra nó đã tồn tại user hay chưa
    if (body.roleName ==='manager'&&roleNameQuanLi && Object.keys(roleNameQuanLi).length >0) {
      throw new ApiError(StatusCodes.CONFLICT, 'This role "manager" is not exist in database')
    }

    const data = await RoleUser.create({
      ...body
    });
    // kiểm tra data nó đã tồn tại hay chưa
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Role creation failed');
    }

    const roleId = data._id;
    const userIds = data.userIds || [];
    const usersWithRoleId = await User.find({ roleIds: roleId });
    // kiểm tra roleids nó có tồn tại hay không
    if (usersWithRoleId.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The role has already been assigned to some users');
    }
    const updatedUsers = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { roleIds: roleId } },
      { new: true }
    );


    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
    });
  } catch (error) {
    next(error);
  }
};
// Lấy thông tin của vai trò

export const getRole = async (req, res, next) => {
  try {
    const roleId = req.params.id; // Lấy roleId từ yêu cầu

    const role = await RoleUser.findById(roleId); // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId

    if (!roleId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id userRole not found')
    }
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Id userRole not found')
    }

    res.status(StatusCodes.OK).json(role); // Trả về kết quả thành công dưới dạng JSON
  } catch (error) {
    next(error)
  }
};
// Cập nhật vai trò


export const updateRole = async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const updates = req.body;

    // Lấy vai trò hiện tại từ cơ sở dữ liệu
    const roleUser = await RoleUser.findByIdAndUpdate(
      roleId,
      { userIds: updates.userIds },
      { new: true, fields: { userIds: 1 } }
    );

    if (!roleUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Role does not exist');
    }

    // Thêm vai trò vào trường roleIds của tài liệu người dùng nếu chưa tồn tại
    if (roleUser.userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: roleUser.userIds } },
        { $set: { roleIds: roleId } }
      );
    }

    // Xóa vai trò khỏi trường roleIds của tài liệu người dùng
    const deletedRolesFromRoleUser = roleUser.userIds.filter(user => !updates.userIds.includes(user));
    if (deletedRolesFromRoleUser.length > 0) {
      await User.updateMany(
        { _id: { $in: deletedRolesFromRoleUser } },
        { $set: { roleIds: roleId } }
      );
    }

    res.status(StatusCodes.OK).json({
      message: 'Success',
      data: roleUser
    });
  } catch (error) {
    next(error)
  }
};
// Xóa vai trò


export const deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.id; // Lấy roleId từ yêu cầu
    const roleNameUser = await RoleUser.findOne({ roleName: 'user' })
    //
    if (!roleNameUser && roleNameUser.length === 0) {
      throw new ApiError(StatusCodes.CONFLICT, 'This role is not exist in database')
    }
    const id = roleNameUser._id
    // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId
    const roleUser = await RoleUser.findById(roleId);
    if (!roleUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User role ID not found');
    }
    if (roleUser.roleName === 'user') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete role "user"');
    }
    if (roleUser.roleName === 'admin') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete role "admin"');
    }


    // Lấy danh sách userIds của vai trò đang được xóa
    const userIds = roleUser.userIds;

    // Tìm và cập nhật các user có userIds đúng với danh sách userIds của vai trò đang được xóa
    await User.updateMany({ _id: { $in: userIds } }, { $set: { roleIds: id } });

    // Xóa vai trò trong cơ sở dữ liệu dựa trên roleId
    await RoleUser.findByIdAndDelete(roleId);

    res.status(StatusCodes.OK).json({ message: 'Success',
      data: roleUser });
  } catch (error) {
    next(error)
  }
};
export const getAll = async (req, res, next) => {
  try {
    const roles = await RoleUser.find(); // Lấy tất cả các vai trò từ cơ sở dữ liệu

    res.status(StatusCodes.OK).json(roles); // Trả về danh sách vai trò dưới dạng JSON
  } catch (error) {
    next(error)
  }
};

