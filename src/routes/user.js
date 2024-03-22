import {
    deleteUser,
    getAllUser,
    getDetailUser,
    login,
    refreshToken,
    register,
    updateUser,
    updateUserById,
    forgotPassword,
    resetPassword,
    updateClient
  } from '../controllers/user.js'
  import { Router } from 'express'
  import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js'
  import { CloudinaryStorage } from 'multer-storage-cloudinary'
  import cloudinary from '../middleware/multer.js'
  import multer from 'multer'
  const routerUser = Router()

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'AVATAR',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    transformation: [{ with: 500, height: 500, crop: 'limit' }]
  })
  const upload = multer({
    storage: storage
  })
// routerUser.post('/register', register)
// routerUser.post('/login', login)
// routerUser.get('/', verifyAccessToken, isAdmin, getAllUser)
// routerUser.get('/userDetail/:id', verifyAccessToken, getDetailUser)
// routerUser.put('/updateUser', verifyAccessToken, updateUser)

// routerUser.put('/:id', verifyAccessToken, isAdmin, updateUserById)
// routerUser.delete('/:id', verifyAccessToken, isAdmin, deleteUser)


routerUser.post('/register',upload.single('avatar'), register)
routerUser.post('/login', login)
routerUser.get('/', getAllUser)
routerUser.get('/userDetail',verifyAccessToken,  getDetailUser)
routerUser.patch(
    '/updateUser',
    upload.single('avatar'),
    verifyAccessToken,
    updateUser
  )
  routerUser.patch(
    '/updateClient',
    upload.single('avatar'),
    verifyAccessToken,
    updateClient
  )

routerUser.post('/forgotPassword', forgotPassword)
routerUser.put('/resetPassword', resetPassword)

routerUser.put('/:id', verifyAccessToken, isAdmin, updateUserById)
routerUser.delete('/:id', verifyAccessToken, isAdmin, deleteUser)

export default routerUser
