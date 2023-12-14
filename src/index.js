import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import routerInit from './routes/index.js'
import mongoose from 'mongoose'
dotenv.config()
const app = express()
const { PORT } = process.env
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api', routerInit)

app.use(express.json())
mongoose.connect('mongodb+srv://admin:123@cluster0.kczgtan.mongodb.net/?retryWrites=true&w=majority').then(() => {
  console.log('Db kết nối thành công');
})
// mongoose.connect('mongodb://127.0.0.1:27017/datn').then(() => {
//   console.log('Db kết nối thành công');
// })
app.use(express())
function start() {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
  })
}
start()

