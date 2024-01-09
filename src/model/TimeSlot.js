import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE = 'Available'
export const FULL = 'Full'
export const statusScreen = [AVAILABLE, FULL]
const TimeSlotSchema = mongoose.Schema(
  {
    ScreenRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScreeningRoom',
      required: true
    },
    Show_scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShowSchedule',
      required: true
    },
    SeatId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
      }
    ],
    status: {
      type: String,
      enum: statusScreen,
      default: AVAILABLE
    },

    destroy: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false, timestamps: true }
)

TimeSlotSchema.plugin(mongoosePaginate)

export default mongoose.model('TimeSlot', TimeSlotSchema)
