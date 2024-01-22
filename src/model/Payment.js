import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const paymentSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    typeBank: {
      type: String,
      required: true
    },
    typePayment: {
      type: String,
      required: true
    },
    cardType: {
      type: String,
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)
// moviePriceSchema.index({ movieId: 1, dayType: 1 }, { unique: true })

paymentSchema.plugin(mongoosePaginate)

export default mongoose.model('Payment', paymentSchema)
