import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    trailer: {
      type: String,
      required: true
    },
    category: {
      type: Number,
      required: true
    },
    desc: String
  },
  { versionKey: false, timestamps: true }
);

productSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', productSchema);
