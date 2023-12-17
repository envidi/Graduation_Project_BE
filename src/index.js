import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import routerInit from './routes/index.js'

import connectDB from './config/connect.js'
dotenv.config()
const app = express()
const { PORT, DATABASE_API } = process.env
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api', routerInit)

app.use(express.json())

// app.use(express())
async function start() {
  try {
    await connectDB(DATABASE_API)
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}
start()

