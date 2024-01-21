import express from 'express';
import { upload } from '../middleware/multer';
import { getAll, getDetail, create, update, remove } from '../controllers/food';
const routerFood = express.Router();

// routerFood.get('/', verifyAccessToken, getAll);
// routerFood.get('/:id', verifyAccessToken, getDetail);
// routerFood.put('/:id', verifyAccessToken, isAdmin, update);
// routerFood.post('/', verifyAccessToken, isAdmin, create);
// routerFood.delete('/:id', verifyAccessToken, isAdmin, remove);

routerFood.get('/', getAll);
routerFood.get('/:id', getDetail);
// routerFood.post('/', create);

// tải 1 file
routerFood.post('/', upload.single('image'), create);
// tải nhiều file
// routerFood.post('/', upload.array('images', 5), create);

routerFood.patch('/:id', upload.single('image'), update);
routerFood.delete('/:id', remove);


export default routerFood;
