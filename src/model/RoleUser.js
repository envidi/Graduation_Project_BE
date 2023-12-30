import mongoose from 'mongoose'

const roleUserSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      default: 'user',
      required: true
    },
    status: {
      type: String,
      required: true,
      default: 'Active'
    },
    userIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('RoleUser', roleUserSchema)
