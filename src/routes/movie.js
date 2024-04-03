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
  getAllMovieHasShow
} from '../controllers/movie.js'

import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
import cloudinary, { upload } from '../middleware/multer.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

// import { checkPermission } from "../middlewares/checkPermission";
const routerProducts = express.Router()

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: 'AVATAR',
//   allowedFormats: ['jpg', 'png', 'jpeg'],
//   transformation: [{ with: 500, height: 500, crop: 'limit' }]
// })
// const upload = multer({
//   storage: storage
// })

routerProducts.get('/', getAll)
routerProducts.get('/showtime', getAllMovieHasShow)
routerProducts.get('/sta', getMovieStatus)
routerProducts.get('/home', getAllMovieHomePage)
routerProducts.get('/search', searchMovie)
routerProducts.get('/movieByCate/:id', getRelatedMoVie)
routerProducts.get('/softdelete', getAllSoftDelete)
routerProducts.get('/:id', getDetail)
routerProducts.patch('/:id', upload.single('avatar'), update)
routerProducts.post('/', upload.single('avatar'), create)
routerProducts.delete('/:id', remove)
routerProducts.patch('/softdelete/:id', softDelete)
routerProducts.patch('/restore/:id', restore)

export default routerProducts
