import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const moviePriceSchema = mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    dayType: {
      type: String,
      enum: ['weekday', 'weekend'],
      required: true
    },
    released: {
      type: Boolean,
      default: false,
    },
    booked: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
)
moviePriceSchema.index({ movieId: 1, dayType: 1 }, { unique: true })

moviePriceSchema.plugin(mongoosePaginate)

export default mongoose.model('MoviePrice', moviePriceSchema)
