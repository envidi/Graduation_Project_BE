import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE = 'Available'
export const FULL = 'Full'
export const statusScreen = [AVAILABLE, FULL]
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
      default: AVAILABLE
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
