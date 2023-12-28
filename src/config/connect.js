import mongoose from 'mongoose'
const connectDB = (url) => {
  return mongoose.connect(url).then(() => {
    // eslint-disable-next-line no-console
    console.log('Db kết nối thành công');
  })
}
export default connectDB

