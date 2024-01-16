import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    // 0 to many optional
    ticketId: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ticket'
        }
      ],
      default: []
    }
  },
  { timestamps: true }
)

foodSchema.plugin(mongoosePaginate);
export default mongoose.model('Food', foodSchema)