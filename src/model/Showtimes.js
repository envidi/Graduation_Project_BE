import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE_SCHEDULE = 'Available'
export const FULL_SCHEDULE = 'Full'
export const statusSchedule = [AVAILABLE_SCHEDULE, FULL_SCHEDULE]
const ShowtimesSchema = mongoose.Schema(
  {
    screenRoomId: {
      type: mongoose.Types.ObjectId,
      ref: 'ScreeningRoom'
    },
    movieId: {
      type: mongoose.Types.ObjectId,
      ref: 'Movie'
    },
    date: {
      type: Date,
      required: true
    },
    timeFrom: {
      type: Date,
      required: true
    },
    timeTo: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum : statusSchedule,
      default: AVAILABLE_SCHEDULE
    },
    destroy: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false, timestamps: true }
)

ShowtimesSchema.plugin(mongoosePaginate)

export default mongoose.model('Showtimes', ShowtimesSchema)
