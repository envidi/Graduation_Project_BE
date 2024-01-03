import { StatusCodes } from "http-status-codes";
import RoleUser from "../model/RoleUser"
import ApiError from '../utils/ApiError.js'
import roleUserValidate from "../validations/roleUser.js";
import User from "../model/user.js";
import findDifferentElements from "../utils/findDifferent.js";
// Thêm vai trò mới
// export const createRole = async (req, res, next) => {
//     try {
//       const { roleName, status, userIds } = req.body;
      
//       // Xác thực dữ liệu đầu vào
//       const validationResult = roleUserValidate.validate({ roleName, status, userIds });
//       if (validationResult.error) {
//         const errorMessage = validationResult.error.details.map((err) => err.message).join(', ');
//         throw new ApiError(StatusCodes.BAD_REQUEST,errorMessage);
//       }
//       // if(roleName==="admin"){
//       //   throw new ApiError(StatusCodes.NOT_FOUND, 'vài trò này dã tồn tại')
//       // }

      
  
//       const role = new RoleUser({ roleName, status });
  
//       // Lấy danh sách ID người dùng từ mảng userIds hiện tại của RoleUser
//       const existingUserIds = role.userIds || [];
  
//       // Kiểm tra xem ID người dùng mới đã tồn tại trong danh sách hay chưa
//       if (!existingUserIds.includes(userIds)) {
//         // Thêm ID người dùng mới vào mảng userIds
//         role.userIds = [...existingUserIds, ...userIds];
//       }
  
//       await role.save();
  
//       res.status(StatusCodes.OK).json(role);
//     } catch (error) {
//       next(error)
//     }
//   };

  export const createRole = async (req, res, next) => {
    try {
      const body = req.body
      const { error } = roleUserValidate.validate(body, { abortEarly: true })
      if (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
      }
      const data = await RoleUser.create({
        ...body,
        slug: slugify(body.roleId)
      })
      if (!data) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Create role failed')
      }
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
    console.error('Lỗi:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Đã xảy ra lỗi trong quá trình lấy thông tin vai trò.' });
  }
};
// Cập nhật vai trò

export const updateRole = async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const updates = req.body;
    
    // Xác thực thông tin cập nhật
    const validationResult = roleUserValidate.validate(updates);
    if (validationResult.error) {
      const errorMessage = validationResult.error.details.map((err) => err.message).join(', ');
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(errorMessage).message);
    }
    
    // Lấy vai trò hiện tại từ cơ sở dữ liệu
    const roleUser = await RoleUser.findById(roleId, 'userIds');

    // Tìm các phần tử khác nhau giữa danh sách người dùng hiện tại và danh sách người dùng mới
    const result = findDifferentElements(roleUser.userIds, updates.userIds);

    // Lọc ra những người dùng mới được thêm vào vai trò
    const newRole = result.filter((user) => updates.userIds.includes(user));

    // Tìm các vai trò đã bị xóa khỏi mảng vai trò của người dùng
    const deletedRolesFromRoleUser = findDifferentElements(newRole, result);

    // Cập nhật dữ liệu vai trò người dùng
    const updateData = await RoleUser.updateOne({ _id: roleId }, updates);
    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cập nhật vai trò người dùng thất bại!');
    }

    // Thêm vai trò vào trường roleIds của tài liệu người dùng nếu chưa tồn tại
    if (newRole && newRole.length > 0) {
      await User.updateMany(
        {
          _id: {
            $in: newRole
          }
        },
        {
          $addToSet: {
            roleIds: roleId
          }
        }
      );
    }

    // Xóa vai trò khỏi trường roleIds của tài liệu người dùng
    if (deletedRolesFromRoleUser && deletedRolesFromRoleUser.length > 0) {
      await User.updateMany(
        {
          _id: {
            $in: deletedRolesFromRoleUser
          }
        },
        {
          $pull: {
            roleIds: roleId
          }
        }
      );
    }

    res.status(StatusCodes.OK).json(updateData);
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'Đã xảy ra lỗi trong quá trình cập nhật vai trò.' });
  }
};
// Xóa vai trò


export const deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.id; // Lấy roleId từ yêu cầu
    

    // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId
    const roleUser = await RoleUser.findById(roleId);
    console.log(roleUser)
    if (!roleUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy ID của vai trò người dùng');
    }

    if (roleUser.roleName === 'user') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể xóa vai trò "user"');
    }

    // Lấy danh sách userIds của vai trò đang được xóa
    const userIds = roleUser.userIds;

    // Tìm và cập nhật các user có userIds đúng với danh sách userIds của vai trò đang được xóa
    await User.updateMany({ _id: { $in: userIds } }, { $set: { roleId: 'user' } });

    // Xóa vai trò trong cơ sở dữ liệu dựa trên roleId
    await RoleUser.findByIdAndDelete(roleId);

    res.status(StatusCodes.OK).json({ message: 'Xóa vai trò thành công.' });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Đã xảy ra lỗi trong quá trình xóa vai trò.' });
  }
};
export const getAll = async (req, res, next) => {
  try {
    const roles = await RoleUser.find(); // Lấy tất cả các vai trò từ cơ sở dữ liệu

    res.status(StatusCodes.OK).json(roles); // Trả về danh sách vai trò dưới dạng JSON
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'Đã xảy ra lỗi trong quá trình lấy danh sách vai trò.' });
  }
};


