import mongoose from 'mongoose'

const CinemaSchema = new mongoose.Schema({
  CinemaName: {
    type: String,
    required: true
  },
  CinemaAdress: {
    type: String,
    required: true
  },
  // ScreeningRoomId:{
  //     type:[mongoose.Schema.Types.ObjectId],
  //     default:[],
  //     ref: 'ScreeningRoom'
  // }

  ScreeningRoomId: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScreeningRoom'
      }
    ],
    default: []
  }
})

export default mongoose.model('Cinema', CinemaSchema)
