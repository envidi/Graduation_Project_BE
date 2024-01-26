import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'
export const RESERVED = 'RESERVED' //vé đã được đặt chỗ nhưng chưa thanh toán.
export const PAID = 'PAID' // vé đã thanh toán.
export const CANCELLED = 'CANCELLED' // vé đã bị hủy
const statusTicket = [RESERVED, PAID, CANCELLED]
const TicketSchema = new mongoose.Schema({
  prices: {
    type: mongoose.Types.ObjectId,
    ref: 'MoviePrice'
  },
  seatId: {
    type: mongoose.Types.ObjectId,
    ref: 'Seat',
    required: true
  },
  foodId: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Food'
      }
    ],
    default: []
  },
  showtimeId: {
    type: mongoose.Types.ObjectId,
    ref: 'Showtimes',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number
  },
  status: {
    type: String,
    enum: statusTicket,
    default: RESERVED,
    required: true
  },
  // thêm trường isDeleted
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { versionKey: false, timestamps: true });

TicketSchema.plugin(mongoosePaginate);

export default mongoose.model('Ticket', TicketSchema);