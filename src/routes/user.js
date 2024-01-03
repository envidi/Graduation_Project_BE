import { deleteUser, getAllUser, getDetailUser, login, refreshToken, register, updateUser, updateUserById } from '../controllers/user.js'
import { Router } from 'express';
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
const routerUser = Router();

routerUser.post('/register', register)
routerUser.post('/login', login)
routerUser.get('/', getAllUser)
routerUser.get('/userDetail/:id', verifyAccessToken, getDetailUser)
routerUser.put('/updateUser', verifyAccessToken, updateUser)

routerUser.put('/:id', verifyAccessToken, isAdmin, updateUserById)
routerUser.delete('/:id', verifyAccessToken, isAdmin, deleteUser)


export default routerUser