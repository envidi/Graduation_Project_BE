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
      _id: {
        type: mongoose.Types.ObjectId,
        ref: 'MoviePrice'
      },
      price: {
        type: Number,
        require: true
      }
    },
    seatId: [
      {
        _id: {
          type: mongoose.Types.ObjectId,
          ref: 'Seat',
          require: true
        },
        typeSeat: {
          type: String,
          require: true
        },
        price: {
          type: Number,
          require: true
        },
        row: {
          type: Number,
          require: true
        },
        column: {
          type: Number,
          require: true
        }
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
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: String,
          required: true
        }
      }
    ],
    totalFood: {
      type: Number
    },
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
