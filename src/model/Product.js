import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
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
    categoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    desc: {
      type: String,
      required: true
    }
  },
  { versionKey: false, timestamps: true }
)

productSchema.pre('findOneAndDelete', async function (next) {
  try {
    // Lấy model Product từ biến đã importc
    const Category = mongoose.model('Category')
    const Product = mongoose.model('Product')
    // Lấy điều kiện tìm kiếm hiện tại của câu lệnh , xác định category
    const filter = this.getFilter()
    // Tìm sản phẩm bị xóa và lấy ra mảng category của sản phẩm bị xóa
    const { categoryId } = await Product.findOne(
      { _id: filter._id },
      { categoryId: 1 }
    )

    if (!categoryId && categoryId.length === 0) return
    // Xóa sản phẩm trong mảng sản phẩm của từng category
    for (let i = 0; i < categoryId.length; i++) {
      await Category.findByIdAndUpdate(
        { _id: categoryId[i] },
        { $pull: { products: filter._id } }
      )
    }

    next()
  } catch (error) {
    next(error)
  }
})
productSchema.plugin(mongoosePaginate)

export default mongoose.model('Product', productSchema)
