import mongoose from 'mongoose' // Erase if already required

// import bcrypt from 'bcrypt'
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
        product: { type: mongoose.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        color: String,
        total: Number
      }
    ],
    address: {
      type: String,
      default: null
    },
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
    roleIds: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoleUser',
      default : null
    }
  },
  {
    timestamps: true
  }
)

userSchema.methods = {
  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    // Kiểm tra xem 'this' có phải là một đối tượng hợp lệ không
    if (this) {
      this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
      this.passwordResetExpires = Date.now() + 15 * 60 * 1000
    } else {
      // Xử lý khi 'this' không hợp lệ
      // eslint-disable-next-line no-console
      console.error('Error: \'this\' is undefined or null.')
    }
    return resetToken
  }
}

//Export the model
export default mongoose.model('User', userSchema)
