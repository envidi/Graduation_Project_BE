import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const watchListSchema = mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    destroy: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false, timestamps: true }
)

watchListSchema.plugin(mongoosePaginate)

export default mongoose.model('Watchlist', watchListSchema)
