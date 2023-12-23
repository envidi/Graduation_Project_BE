import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    isDeleteable: {
      type: Boolean,
      required: true,
      default : true
    },
    products: [{
      type: mongoose.Types.ObjectId,
      ref: 'Product'
    }],
    slug : {
      type : String
    }
  },
  { versionKey: false, timestamps: true }
);

categorySchema.pre('findOneAndDelete', async function (next) {
  try {
    // Lấy model Product từ biến đã importc
    const Product = mongoose.model('Movie')
    // Lấy điều kiện tìm kiếm hiện tại của câu lệnh , xác định category
    const filter = this.getFilter()

    await Product.updateMany(
      { categoryId : filter._id },
      { $pull : { categoryId : filter._id } }
    )
    next()
  } catch (error) {
    next(error)
  }

})
categorySchema.plugin(mongoosePaginate);

export default mongoose.model('Category', categorySchema);
