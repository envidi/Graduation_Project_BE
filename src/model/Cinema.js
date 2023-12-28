import mongoose from 'mongoose'

const CinemaSchema = new mongoose.Schema({
    CinemaName: {
        type: String,
        required: true
    },
    CinemaAdress: {
        type:String,
        required:true,
    },

    ScreeningRoomId: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ScreeningRoom',
        }],
        default: [],
      },
})

export default  mongoose.model('Cinema', CinemaSchema);  