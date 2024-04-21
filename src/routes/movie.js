import express from 'express'
import {
  create,
  getAll,
  getAllSoftDelete,
  getDetail,
  remove,
  restore,
  softDelete,
  update,
  getRelatedMoVie,
  getAllMovieHomePage,
  searchMovie,
  getMovieStatus,
  getAllMovieHasShow,
  getCountMovie
} from '../controllers/movie.js'

import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
// import { upload } from '../middleware/multer.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
// import cloudinary from '../middleware/multer.js'
import multer from 'multer'
import cloudinary from '../middleware/multer.js'
// import cloudinary, { upload } from '../middleware/multer.js'

const routerProducts = express.Router()

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'AVATAR',
  allowedFormats: ['jpg', 'png', 'jpeg'],
  transformation: [{ with: 500, height: 500, crop: 'limit' }]
})
const upload = multer({
  storage: storage
})



routerProducts.get('/', getAll)
routerProducts.get('/count', getCountMovie)
routerProducts.get('/showtime', getAllMovieHasShow)
routerProducts.get('/sta', getMovieStatus)
routerProducts.get('/home', getAllMovieHomePage)
routerProducts.get('/search', searchMovie)
routerProducts.get('/movieByCate/:id', getRelatedMoVie)
routerProducts.get('/softdelete', getAllSoftDelete)
routerProducts.get('/:id', getDetail)
routerProducts.patch('/:id', upload.single('image'), update)
routerProducts.post('/', upload.single('image'), create)
routerProducts.delete('/:id', remove)
routerProducts.patch('/softdelete/:id', softDelete)
routerProducts.patch('/restore/:id', restore)

export default routerProducts
