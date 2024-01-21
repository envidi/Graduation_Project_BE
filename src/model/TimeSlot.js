import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE_TIMESLOT = 'Available'
export const FULL_TIMESLOT = 'Full'
export const statusTimeSlot = [AVAILABLE_TIMESLOT, FULL_TIMESLOT]
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
      enum: statusTimeSlot,
      default: AVAILABLE_TIMESLOT
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
