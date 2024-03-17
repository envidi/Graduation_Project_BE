import { types } from 'joi'
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
export const RESERVED = 'RESERVED' //vé đã được đặt chỗ nhưng chưa thanh toán.
export const PAID = 'PAID' // vé đã thanh toán.
export const CANCELLED = 'CANCELLED' // vé đã bị hủy
const statusTicket = [RESERVED, PAID, CANCELLED]
const TicketSchema = new mongoose.Schema(
  {
    priceId: {
      type: mongoose.Types.ObjectId,
      ref: 'MoviePrice'
    },
    seatId: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Seat',
        require: true
      }
    ],
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      require: true
    },
    movieId: {
      type: mongoose.Types.ObjectId,
      ref: 'Movie'
    },
    cinemaId: {
      type: mongoose.Types.ObjectId,
      ref: 'Cinema'
    },
    screenRoomId: {
      type: mongoose.Types.ObjectId,
      ref: 'ScreeningRoom'
    },
    paymentId: {
      type: mongoose.Types.ObjectId,
      ref: 'Payment'
    },
    foods: [
      {
        foodId: {
          type: String,
          required: true
          // ref: 'Food'
        },
        quantityFood: {
          type: Number,
          required: true
        }
      }
    ],
    showtimeId: {
      type: mongoose.Types.ObjectId,
      ref: 'Showtimes',
      required: true
    },
    quantity: {
      type: Number
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
  },
  { versionKey: false, timestamps: true }
)

TicketSchema.plugin(mongoosePaginate)

export default mongoose.model('Ticket', TicketSchema)
