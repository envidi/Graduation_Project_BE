import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const ScreenRoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    CinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    TimeSlotId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: true
    }],
    destroy: {
      type: Boolean,
      default: false
    },
    showTimes : [
      {
        type : mongoose.Types.ObjectId,
        ref : "Showtimes",
    }]
  },
  { versionKey: false, timestamps: true }
)

ScreenRoomSchema.plugin(mongoosePaginate)

export default mongoose.model('ScreeningRoom', ScreenRoomSchema)
