import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE_SCREEN = 'Available'
export const CANCELLED_SCREEN = 'Cancelled'
export const FULL_SCREEN = 'Full'
export const statusScreen = [AVAILABLE_SCREEN, FULL_SCREEN, CANCELLED_SCREEN]
const ScreenRoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    CinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    TimeSlotId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: true
    }],
    status : {
      type : String,
      enum : statusScreen,
      default : AVAILABLE_SCREEN
    },
    destroy: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false, timestamps: true }
)

ScreenRoomSchema.plugin(mongoosePaginate)

export default mongoose.model('ScreeningRoom', ScreenRoomSchema)
