import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const AVAILABLE = 'Available'
export const FULL = 'Full'
export const statusScreen = [AVAILABLE, FULL]
const ShowtimesSchema = mongoose.Schema(
  {
    screenRoomId: [
      {
        type : mongoose.Types.ObjectId,
        ref : 'ScreeningRoom'
      }],

    movieId: {
      type : mongoose.Types.ObjectId,
      ref : 'Movie'

    },
    date: {
      type : String,
      required : true
    },
    times :  {
      type : String,
      required : true
    },
    status: {
      type: String,
      default : AVAILABLE
    }

  },
  { versionKey: false, timestamps: true }
)

ShowtimesSchema
  .plugin(mongoosePaginate)

export default mongoose.model('Showtimes', ShowtimesSchema
)
