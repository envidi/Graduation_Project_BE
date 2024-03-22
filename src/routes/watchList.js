import express from 'express'
import { create, getAll, remove } from '../controllers/Watchlist.js'

import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
import { upload } from '../middleware/multer.js'

// import { checkPermission } from "../middlewares/checkPermission";
const routerWatchList = express.Router()

// routerWatchList.get('/', verifyAccessToken, getAll);
// routerWatchList.get('/:id', verifyAccessToken, getDetail);
// routerWatchList.put('/:id', verifyAccessToken, isAdmin, update);
// routerWatchList.post('/', verifyAccessToken, isAdmin, create);
// routerWatchList.delete('/:id', verifyAccessToken, isAdmin, remove);


routerWatchList.get('/:id', getAll)
routerWatchList.post('/', create)
routerWatchList.delete('/:id', remove)

export default routerWatchList