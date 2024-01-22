import express from 'express'
import {
  create,
  getAll,
  getDetail,
  remove,
  update
} from '../controllers/MoviePrice.js'

const routerMoviePrice = express.Router()

routerMoviePrice.get('/', getAll)
routerMoviePrice.get('/:id', getDetail)
routerMoviePrice.patch('/:id', update)
routerMoviePrice.post('/', create)
routerMoviePrice.delete('/:id', remove)

export default routerMoviePrice
