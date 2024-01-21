import mongoose from 'mongoose' // Erase if already required
import { ObjectId } from 'mongodb'
// import bcrypt from 'bcrypt'
import RoleUser from "./RoleUser.js"
import crypto from 'crypto'
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    mobile: {
      type: Number,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    cart: [
      {
        product: { type: mongoose.Types.ObjectId, ref: 'Movie' },
        quantity: Number,
        color: String,
        total: Number
      }
    ],
    address: { type: Array, default: [] },
    wishlist: [{ type: mongoose.Types.ObjectId, ref: 'Movie' }],
    isBlocked: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String
    },
    passwordChangedAt: {
      type: String
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: String
    },
    roleIds:  {
      type: mongoose.Schema.Types.ObjectId, // Chỉ định kiểu dữ liệu là mảng ObjectId
      ref: 'RoleUser'
    }
  } ,
  {
    timestamps: true
  }
)

// Middleware pre để đặt giá trị mặc định khi tạo mới
userSchema.pre('save', async function (next) {
  if (!this.roleIds) {
    // Nếu roleIds không tồn tại, đặt giá trị mặc định là 'user'
    const defaultRole = await RoleUser.findOne({ roleName: 'user' }); // Đặt giá trị mặc định từ RoleUser
    this.roleIds = defaultRole._id;
  }

  // Tiếp tục quá trình lưu
  next();
});


// userSchema.methods = {
//   createPasswordChangedToken: function () {
//     const resetToken = crypto.randomBytes(32).toString('hex')
//     // Kiểm tra xem 'this' có phải là một đối tượng hợp lệ không
//     if (this) {
//       this.passwordResetToken = crypto
//         .createHash('sha256')
//         .update(resetToken)
//         .digest('hex')
//       this.passwordResetExpires = Date.now() + 15 * 60 * 1000
//     } else {
//       // Xử lý khi 'this' không hợp lệ
//       // eslint-disable-next-line no-console
//       console.error('Error: \'this\' is undefined or null.')
//     }
//     return resetToken
//   }
// }

//Export the model
export default mongoose.model('User', userSchema)
