/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import routerInit from './routes/index.js'
import { errorHandlingMiddleware } from './middleware/errorHandlerMiddleware.js'
import connectDB from './config/connect.js'
import { env } from './config/environment.js'
import { corsOptions } from './config/cors.js'
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json())
app.use(cors())

app.use('/api', routerInit)
// Middleware xử lý lỗi tập trung
app.use(errorHandlingMiddleware)


// app.use(express())
async function start() {
  try {
    await connectDB(env.DATABASE_API)
    app.listen(env.PORT, () => {
      console.log(`http://${env.HOST_NAME}:${env.PORT}`)
    })
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
}
start()
