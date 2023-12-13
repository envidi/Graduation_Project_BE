<<<<<<< HEAD
import { deleteUser, forgotPassword, getAllUser, getUserDetail, login, refreshToken, register, resetPassword, updateUser, updateUserById } from '../controllers/user.js';
=======
import {deleteUser, getAllUser, getUserDetail, login, refreshToken, register, updateUser, updateUserById } from '../controllers/user.js';
>>>>>>> 029e9e7fa839d11dd7e07685089859dfc759ebd9
import { Router } from 'express';
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
const routerUser = Router();

routerUser.post('/register', register)
routerUser.post('/login', login)
routerUser.get('/', verifyAccessToken, isAdmin, getAllUser)
routerUser.get('/userDetail', verifyAccessToken, getUserDetail)
routerUser.put('/updateUser', verifyAccessToken, updateUser)


routerUser.put('/:id', verifyAccessToken, isAdmin, updateUserById)
routerUser.get('/refreshToken', refreshToken)
<<<<<<< HEAD
routerUser.get('/forgotPassword', forgotPassword)
routerUser.put('/resetPassword', resetPassword)
routerUser.delete('/:id', verifyAccessToken, isAdmin, deleteUser)
=======

routerUser.delete('/:id',verifyAccessToken, isAdmin, deleteUser)
>>>>>>> 029e9e7fa839d11dd7e07685089859dfc759ebd9

export default routerUser