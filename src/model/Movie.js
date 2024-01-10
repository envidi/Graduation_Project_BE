import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
const COMING_SOON = 'COMING_SOON'
const RELEASED = 'RELEASED'
const HOT = 'HOT'
const statusProduct = [COMING_SOON, RELEASED, HOT]
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    age_limit: {
      type: Number,
      required: true
    },
    fromDate: {
      type: String,
      required: true
    },
    toDate: {
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
    },
    status: {
      type: String,
      enum: statusProduct,
      required: true
    },
    rate: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true
    },
    show_scheduleId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShowSchedule'
      }
    ],
    prices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MoviePrice',
        validate: [(val) => val <= 2, '{PATH} exceeds the limit of 2']
      }
    ],
    slug: {
      type: String
    },
    destroy : {
      type : Boolean,
      default : false
    },
    showTimes : [
      {
        type : mongoose.Types.ObjectId,
        ref : 'Showtimes'
      }]
  },
  { versionKey: false, timestamps: true }
)

productSchema.pre('findOneAndDelete', async function (next) {
  try {
    // Lấy model Product từ biến đã importc
    const Category = mongoose.model('Category')
    const Product = mongoose.model('Movie')
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

export default mongoose.model('Movie', productSchema)
