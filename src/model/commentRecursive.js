import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const commentRecursiveSchema = mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      unique: true
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }]
  },
  { versionKey: false, timestamps: true }
)
// moviePriceSchema.index({ movieId: 1, dayType: 1 }, { unique: true })

commentRecursiveSchema.plugin(mongoosePaginate)

export default mongoose.model('CommentRecursive', commentRecursiveSchema)
