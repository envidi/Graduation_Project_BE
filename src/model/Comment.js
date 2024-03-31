import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const commentSchema = mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    comments: {
      type: Array,
      default: []
    },
    like: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,

      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  { versionKey: false, timestamps: true }
)
// moviePriceSchema.index({ movieId: 1, dayType: 1 }, { unique: true })

commentSchema.plugin(mongoosePaginate)

export default mongoose.model('Comment', commentSchema)
