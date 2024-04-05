import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
// Ghế có thể được đặt khi nó ở trạng thái trống.
//Đây là trạng thái mặc định khi một suất chiếu mới được tạo.
export const AVAILABLE = 'Available'

// Ghế đã được người dùng chọn, đặt và thanh toán thành công.
//Đây là trạng thái khi vé đã được bán và ghế không còn khả dụng cho việc đặt chỗ.
export const SOLD = 'Sold'

// Ghế đã được người dùng chọn và đặt, nhưng chưa thanh toán.
//Trong thời gian đặt ghế, người dùng có quyền hoàn tác đặt ghế hoặc thanh toán để xác nhận.
export const RESERVED = 'Reserved'

//Ghế không khả dụng cho việc đặt chỗ, có thể do nó đã bị đặt trước đó cho một suất chiếu khác
//hoặc vấn đề kỹ thuật khác
export const UNAVAILABLE = 'Unavailable'
export const statusSeat = [AVAILABLE, SOLD, RESERVED, UNAVAILABLE]
export const NORMAL = 'normal'
export const VIP = 'VIP'

const seatChema = new mongoose.Schema(
  {
    typeSeat: {
      type: String,
      enum: [NORMAL, VIP],
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    row: {
      type: Number,
      required: true
    },
    column: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: statusSeat,
      default: AVAILABLE
    },
    ScreeningRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScreeningRoom',
      required: true
    },
    ShowScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtimes',
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)
seatChema.plugin(mongoosePaginate)

export default mongoose.model('Seat', seatChema)
