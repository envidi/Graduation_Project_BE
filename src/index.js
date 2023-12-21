/* eslint-disable no-console */
import express from 'express'
import bodyParser from 'body-parser'
import routerInit from './routes/index.js'

import connectDB from './config/connect.js'
import { env } from './config/environment.js'
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api', routerInit)

app.use(express.json())

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
