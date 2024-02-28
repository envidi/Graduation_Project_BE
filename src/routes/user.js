import { deleteUser, getAllUser, getDetailUser, login, refreshToken, register, updateUser, updateUserById, forgotPassword, resetPassword } from '../controllers/user.js'
import { Router } from 'express';
import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../middleware/multer.js';
import multer from 'multer';
const routerUser = Router();


const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    folder: "AVATAR",
    allowedFormats : ['jpg','png', 'jpeg'],
    transformation: [{with: 500, height:500, crop:'limit'}]
})
const upload = multer({
    storage:storage
})

routerUser.post('/register',upload.single('avatar'), register)
routerUser.post('/login', login)
routerUser.get('/', getAllUser)
routerUser.get('/userDetail',verifyAccessToken,  getDetailUser)
routerUser.put('/updateUser',upload.single('avatar'), verifyAccessToken, updateUser)
routerUser.post('/forgotPassword',  forgotPassword)
routerUser.put('/resetPassword' , resetPassword)

routerUser.put('/:id',verifyAccessToken, isAdmin, updateUserById)
routerUser.delete('/:id', verifyAccessToken, isAdmin, deleteUser)


export default routerUser