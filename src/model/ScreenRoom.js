import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE_SCREEN = 'Available'
export const CANCELLED_SCREEN = 'Cancelled'
export const FULL_SCREEN = 'Full'
export const statusScreen = [AVAILABLE_SCREEN, FULL_SCREEN, CANCELLED_SCREEN]
export const PROJECTOR_1 = 'Projector_1'
export const PROJECTOR_2 = 'Projector_2'
export const PROJECTOR_3 = 'Projector_3'
export const projectors = [PROJECTOR_1, PROJECTOR_2, PROJECTOR_3]
const ScreenRoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    NumberSeat: {
      type: Number,
      default: 20,
      required: true
    },
    projector: {
      type: String,
      enum: projectors,
      required: true
    },
    CinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    TimeSlotId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot'
    }],
    status: {
      type: String,
      enum: statusScreen,
      default: AVAILABLE_SCREEN
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
