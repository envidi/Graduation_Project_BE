import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE = 'Available'
export const FULL = 'Full'
export const statusScreen = [AVAILABLE, FULL]
const ScreenRoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum : statusScreen,
      default : AVAILABLE
    },
    SeatId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
      }
    ],
    CinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    show_scheduleId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShowSchedule',
      required: true
    }],
    destroy: {
      type: Boolean,
      default: false
    },
    showTimes : [
      {
        type : mongoose.Types.ObjectId,
        ref : "Showtimes",
    }]
  },
  { versionKey: false, timestamps: true }
)

ScreenRoomSchema.plugin(mongoosePaginate)

export default mongoose.model('ScreeningRoom', ScreenRoomSchema)
