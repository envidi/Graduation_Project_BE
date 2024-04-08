import mongoose from 'mongoose' // Erase if already required
// import bcrypt from 'bcrypt'
import RoleUser from './RoleUser.js'
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
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    confirmPassword: {
      type: String,
      required: true
    },
    oldPassword: {
      type: String
    },
    avatar: {
      type: String,
      default: ''
    },
    cart: [
      {
        product: { type: mongoose.Types.ObjectId, ref: 'Movie' },
        quantity: Number,
        color: String,
        total: Number
      }
    ],
    address: {
      type: String,
      default: ''
    },
    age: {
      type: Number,
      default: 0
    },
    sex: {
      type: String,
      enum: ['Nam', 'Nữ']
    },
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
    roleIds: {
      type: mongoose.Schema.Types.ObjectId, // Chỉ định kiểu dữ liệu là mảng ObjectId
      ref: 'RoleUser'
    }
  },
  {
    timestamps: true
  }
)

// Middleware pre để đặt giá trị mặc định khi tạo mới
userSchema.pre('save', async function (next) {
  if (!this.roleIds) {
    // Nếu roleIds không tồn tại, đặt giá trị mặc định là 'user'
    const defaultRole = await RoleUser.findOne({ roleName: 'user' }) // Đặt giá trị mặc định từ RoleUser
    this.roleIds = defaultRole._id
  }

  // Tiếp tục quá trình lưu
  next()
})

// userSchema.methods = {

//   changePasswordToken : function(){
//     // reset lại token của user . randomBytes là độ dài , hex là hệ cơ số
//     const resetToken = crypto.randomBytes(32).toString("hex")
//     // băm token ,
//       this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//       this.passwordResetExpires = Date.now() + 5 * 60 *1000

//     return resetToken
//   }

// }

userSchema.methods = {
  changePasswordToken: function () {
    // Sinh một số ngẫu nhiên từ 10000 đến 99999 (5 số)
    const randomToken = Math.floor(10000 + Math.random() * 90000)
    // Lưu token vào trường passwordResetToken
    this.passwordResetToken = randomToken.toString() // Chuyển số thành chuỗi
    this.passwordResetExpires = Date.now() + 5 * 60 * 1000 // Thời gian hết hạn: hiện tại + 5 phút

    return randomToken.toString() // Trả về token 5 số dưới dạng chuỗi
  }
}

//Export the model
export default mongoose.model('User', userSchema)
