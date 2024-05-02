import mongoose from 'mongoose';

const limitRoleName=['admin', 'staff', 'user'];
const roleUserSchema = new mongoose.Schema({
  roleName: {
    type: String,
    default: 'user',
    unique:true,
    enum:limitRoleName,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'Active'
  },
  userIds: {
    type: [mongoose.Schema.Types.ObjectId], // Chỉ định kiểu dữ liệu là mảng ObjectId
    default: [], // Đặt giá trị mặc định là một mảng rỗng
    ref:'User'
  }
}, {
  timestamps: true
});

// Phương thức tùy chỉnh để xóa nhiều bản ghi
roleUserSchema.statics.deleteManyByIds = function (ids) {
  return this.deleteMany({ _id: { $in: ids } });
};

export default mongoose.model('RoleUser', roleUserSchema);