import mongoose from 'mongoose'
const connectDB = (url) => {
  return mongoose.connect(url).then(() => {
    console.log('Db kết nối thành công');
  })
}
export default connectDB

