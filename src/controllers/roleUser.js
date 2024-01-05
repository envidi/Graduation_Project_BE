import { StatusCodes } from "http-status-codes";
import RoleUser from "../model/RoleUser"
import ApiError from '../utils/ApiError.js'
import roleUserValidate from "../validations/roleUser.js";
import User from "../model/user.js";
import findDifferentElements from "../utils/findDifferent.js";
// Thêm vai trò mới


export const createRole = async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = roleUserValidate.validate(body, { abortEarly: true });
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message);
    }

    const data = await RoleUser.create({
      ...body,
    });

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Role creation failed');
    }
    if (data.roleName==="admin") {
      throw new ApiError(StatusCodes.NOT_FOUND,  'The role "admin" already exists');
    }
    const roleId = data._id;
    const userIds = data.userIds || [];
    const usersWithRoleId = await User.find({ roleIds: roleId });

    if (usersWithRoleId.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The role has already been assigned to some users');
    }
    const updatedUsers = await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { roleIds: roleId } },
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
    console.error('Lỗi:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while retrieving the role list.' });
  }
};
// Cập nhật vai trò

// export const updateRole = async (req, res, next) => {
//   try {
//     const roleId = req.params.id;
//     const updates = req.body;
//     const roleuser="65984c549f4041a641e8dec3";
    
//     // Xác thực thông tin cập nhật
//     const validationResult = roleUserValidate.validate(updates);
//     if (validationResult.error) {
//       const errorMessage = validationResult.error.details.map((err) => err.message).join(', ');
//       throw new ApiError(StatusCodes.BAD_REQUEST, new Error(errorMessage).message);
//     }
//     // Lấy vai trò hiện tại từ cơ sở dữ liệu
//     const roleUser = await RoleUser.findById(roleId, 'userIds');
//     if (!roleUser && Object.keys(roleUser)===0) {
//       throw new ApiError(StatusCodes.BAD_REQUEST,"Role does not exist")
//     }
//     // Tìm các phần tử khác nhau giữa danh sách người dùng hiện tại và danh sách người dùng mới
//     const result = findDifferentElements(roleUser.userIds, updates.userIds);
//     // console.log(result)
//     // Lọc ra những người dùng mới được thêm vào vai trò
//     const newRole = result.filter((user) => updates.userIds.includes(user));
//     // console.log(newRole)

//     // Tìm các vai trò đã bị xóa khỏi mảng vai trò của người dùng
//     const deletedRolesFromRoleUser = findDifferentElements(newRole, result);

//     // Cập nhật dữ liệu vai trò người dùng
//     const updateData = await RoleUser.updateOne({ _id: roleId }, updates);
//     if (!updateData) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'User role update failed!');
//     }
//     console.log(newRole)
//     // Thêm vai trò vào trường roleIds của tài liệu người dùng nếu chưa tồn tại
//     if (newRole && newRole.length > 0) {
//       await User.updateMany(
//         {
//           _id: {
//             $in: newRole
//           }
//         },
//         {
//           $set: {
//             roleIds: roleId
//           }
//         }
//       );
//     }
//     // Xóa vai trò khỏi trường roleIds của tài liệu người dùng

//     if (deletedRolesFromRoleUser && deletedRolesFromRoleUser.length > 0) {
//       await User.updateMany(
//         {
//           _id: {
//             // tìm ra tất cả những id trong mảng dùng $in
//             $in: deletedRolesFromRoleUser
//           }
//         },
//         {
//           // Xóa productId khỏi products trong category thì dùng $pull
//           $set: {
//             roleIds: roleuser
//           }
//         }
//       )
//     }

//     res.status(StatusCodes.OK).json({message: 'Success',
//     data: updateData});
//   } catch (error) {
//     console.error('error:', error);
//     res.status(StatusCodes.BAD_REQUEST).json({ message: 'An error occurred while retrieving the role list.' });
//   }
// };
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
    const roleUser = await RoleUser.findOneAndUpdate(
      { _id: roleId },
      { $set: { userIds: updates.userIds } },
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
    console.error('error:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'An error occurred while updating the role.' });
  }
};
// Xóa vai trò


export const deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.id; // Lấy roleId từ yêu cầu
    const id="65984c549f4041a641e8dec3";

    // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId
    const roleUser = await RoleUser.findById(roleId);
    console.log(roleUser)
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
        data: roleUser});
  } catch (error) {
    console.error('Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Đã xảy ra lỗi trong quá trình xóa vai trò.' });
  }
};
export const getAll = async (req, res, next) => {
  try {
    const roles = await RoleUser.find(); // Lấy tất cả các vai trò từ cơ sở dữ liệu

    res.status(StatusCodes.OK).json(roles); // Trả về danh sách vai trò dưới dạng JSON
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'An error occurred while retrieving the role list.' });
  }
};

// export const addUserToRole = async (req, res, next) => {
//     try {
//       const roleId = req.params.id; // Lấy roleId từ yêu cầu
//       const userId = req.body.userId; // Lấy userId từ yêu cầu
  
//       // Tìm vai trò trong cơ sở dữ liệu dựa trên roleId
//       const roleUser = await RoleUser.findById(roleId);
//       if (!roleUser) {
//         throw new ApiError(StatusCodes.NOT_FOUND, 'User role ID not found');
//       }
  
//       // Lấy danh sách userIds hiện tại của vai trò
//       const userIds = roleUser.userIds;
  
//       // Kiểm tra xem userId đã tồn tại trong danh sách userIds hay chưa
//       if (userIds.includes(userId)) {
//          throw new ApiError(StatusCodes.BAD_REQUEST, 'User ID already exists in the role');
//       }
  
//       // Thêm userId mới vào mảng userIds
//       userIds.push(userId);
  
//       // Cập nhật vai trò với danh sách userIds đã cập nhật
//       await RoleUser.findByIdAndUpdate(roleId, { userIds });
  
//       // Thêm roleId vào mảng roleIds của người dùng
//       await User.updateMany(
//         { _id: userId },
//         { $addToSet: { roleIds: roleId } }
//       );
  
//       res.status(StatusCodes.OK).json({ message: 'Success', data: roleUser });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while adding user to the role.' });
//     }
//   };
