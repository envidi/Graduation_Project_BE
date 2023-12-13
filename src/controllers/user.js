import asyncHandler from 'express-async-handler';
import User from '../model/user.js'
import bcrypt from 'bcrypt';
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { AccessTokenUser, RefeshTokenUser } from '../middleware/jwt.js';

export const register =   asyncHandler(async(req,res) =>{
    const {email , password , name} = req.body;
    if(!email || !password || !name) 
    return res.status(400).json({
        sucess:false,
        message: "missing inputs"
    })
    const user = await User.findOne({email})
    if(user) {
        throw new Error('email đã được đăng kí')
    }
    const hashPassword = await bcrypt.hash(password , 10)
    const response = await  User.create({
        ...req.body,
        password : hashPassword
    })
    return res.status(200).json({
        message :  response ? "Đăng kí thành công" : "Đăng kí thất bại",
        response
    })
})

export const login =   asyncHandler(async(req,res) =>{
    const {email , password } = req.body;
    if(!email || !password ) 
    return res.status(400).json({
        sucess:false,
        message: "missing inputs"
    })
    

    const response = await User.findOne({email})
    if(!response) {
        return res.json("Email chưa được đăng kí")
    }
    const isMatch = await bcrypt.compare(
        password,
        response.password
    )
    if(!isMatch) {
        return res.json('mật khẩu không khớp')
    }



    if(response && isMatch){
        const {password, role,refreshToken, ...userData} = response.toObject()
        // AccessToken dùng để xác thực người dùng, phân quyền
        const Accesstoken = AccessTokenUser(response._id, role)
        // refreshToken dùng để cập nhật accessToken
        const newRefreshToken = RefeshTokenUser(response._id)

        // Lưu refreshToken vào db
        await User.findByIdAndUpdate(response._id, {refreshToken : newRefreshToken}, {new:true})
        res.cookie('refreshToken', newRefreshToken, {httpOnly:true, maxAge: 60*60*1000})
        return res.status(200).json({
            message: "đăng nhập thành công",
            Accesstoken,
            userData
        })
    }
    
})



export const getAllUser =   asyncHandler(async(req,res) =>{

    const response = await User.find({})
     if(!response || response.length === 0){
        return res.status(404).json({
            message:"Không tìm thấy sản phẩm"
        })
     }   

    return res.status(200).json({
        message: "Gọi danh sách users thành công",
        response
    })
})

export const getUserDetail = asyncHandler(async(req,res) =>{
    const {_id} = req.user
    // select dùng để giấu các trường không mong muốn bị lộ 
    const response = await User.findById(_id).select('-password  -refreshToken')

    return res.status(200).json({
        message: "Gọi users thành công",
        response
    })
})
// export const getDetailUser = asyncHandler(async(req,res) =>{

//     const {id} = req.params
//     const detailProduct = await User.findById(id)
    
//     return res.status(200).json({
//         success : detailProduct ? "Gọi sản phẩm thành công" : false,
//         message : detailProduct ? detailProduct : "Gọi sản phẩm thất bại"
//     })
// })

export const refreshToken = asyncHandler(async(req,res) =>{
    // lấy cookie
    const cookie = req.cookies;
    // kiểm tra
    if(!cookie || !cookie.refreshToken) throw new Error('No refresh token') ;
    // xác thực
    const rs = jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({_id:rs._id, refreshToken:cookie.refreshToken})

    return res.status(200).json({
        success : response ? true : false,
        newAccessToken : response ? AccessTokenUser(response._id, response.role) : "Token not match"
    })
})







export const deleteUser =   asyncHandler(async(req,res) =>{

    const response = await User.findByIdAndDelete(req.params.id)
    if(!response || response.length === 0) {
        return res.json(" user không tồn tại")
    }
   
    return res.status(200).json({
        message: "Xóa user thành công",
        response
    })
})

export const updateUser =   asyncHandler(async(req,res) =>{
    const {_id} = req.user
    if(!_id || Object.keys(req.body).length === 0) throw new Error("Missing inputs")
    const response = await User.findByIdAndUpdate(_id, req.body, {new:true})
    if(!response || response.length === 0) {
        return res.json(" user không tồn tại")
    }
   
    return res.status(200).json({
        message: "Update user thành công",
        response
    })
})


export const updateUserById =   asyncHandler(async(req,res) =>{
    const {id} = req.params
    if(!id || Object.keys(req.body).length === 0) throw new Error("Missing inputs")
    const response = await User.findByIdAndUpdate(id, req.body, {new:true})
    if(!response || response.length === 0) {
        return res.json(" user không tồn tại")
    }
   
    return res.status(200).json({
        message: "Update user thành công",
        response
    })
})



