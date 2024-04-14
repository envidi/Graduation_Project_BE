import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { generateTimeBasedOrderNumber } from '../utils/ToStringArray'
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
      _id: {
        type: mongoose.Types.ObjectId,
        ref: 'Movie',
        require: true
      },
      name: {
        type: String,
        require: true
      },
      categoryId: [
        {
          _id: {
            type: mongoose.Types.ObjectId,
            ref: 'Category'
          },
          name: {
            type: String,
            require: true
          }
        }
      ],
      image: {
        type: String,
        require: true
      }
    },
    cinemaId: {
      _id: {
        type: mongoose.Types.ObjectId,
        ref: 'Cinema',
        require: true
      },
      CinemaName: {
        type: String
      },
      CinemaAdress: {
        type: String
      }
    },
    screenRoomId: {
      _id: {
        type: mongoose.Types.ObjectId,
        ref: 'ScreeningRoom',
        require: true
      },
      name: {
        type: String
      }
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
      _id: {
        type: mongoose.Types.ObjectId,
        ref: 'Showtimes',
        required: true
      },
      timeFrom: {
        type: String
      }
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
TicketSchema.pre('save', function (next) {
  if (!this._doc.orderNumber) {
    this._doc.orderNumber = generateTimeBasedOrderNumber()
  }
  next()
})

export default mongoose.model('Ticket', TicketSchema)
