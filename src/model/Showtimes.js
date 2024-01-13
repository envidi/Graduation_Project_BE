import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE = 'Available'
export const FULL = 'Full'
export const statusScreen = [AVAILABLE, FULL]
const ShowtimesSchema = mongoose.Schema(
  {
    screenRoomId: [
      {
        type: mongoose.Types.ObjectId, 
        ref: 'ScreeningRoom'
      }
    ],

    movieId: {
      type: mongoose.Types.ObjectId,
      ref: 'Movie'
    },
    date: {
      type: String,
      required: true
    },
    timeFrom: {
      type: Date,
      // min : Date.now(),
      required: true
    },
    timeTo: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: AVAILABLE
    },
    destroy : {
      type : Boolean,
      default : false
    }
  },
  { versionKey: false, timestamps: true }
)

ShowtimesSchema.plugin(mongoosePaginate)

export default mongoose.model('Showtimes', ShowtimesSchema)
