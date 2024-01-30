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

    // 0 to many optional
    ticketId: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ticket'
        }
      ],
      default: []
    },
    // thêm trường isDeleted
    isDeleted: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true })

/* Khi thêm phương thức này vào foodSchema.query,
tạo ra một hàm trợ giúp gọi trên một query Mongoose để lọc ra các bản ghi mà không bị đánh dấu là đã xóa.*/
foodSchema.query.notDeleted = function () {
  return this.where({ isDeleted: false });
}

foodSchema.plugin(mongoosePaginate);
export default mongoose.model('Food', foodSchema)