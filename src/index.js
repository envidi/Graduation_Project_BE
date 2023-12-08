import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
dotenv.config()
const app = express()
const { PORT } = process.env
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(express.json())

app.use(express())
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
