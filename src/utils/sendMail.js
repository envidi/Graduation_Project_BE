import  nodemailer from 'nodemailer';
import { env } from '../config/environment.js'
import dotenv from 'dotenv'
dotenv.config()

export const sendEmailService = async ({email, html}) =>{
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });


      let info = await transporter.sendMail({
        from: '"Đặt lịch xem phim thành công 👻" nguyenthanhnamcao392003@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Thông báo đặt lịch vé xem phim <3", // Subject line
        text: "Thông tin vé ", // plain text body
        html: html, // html body
      });
      return info
    
}

export const sendEmailPassword = async ({email, html}) =>{
  let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });


    let info = await transporter.sendMail({
      from: '"Quên mật khẩu à bạn ??? 👻" nguyenthanhnamcao392003@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Quên mật khẩu ? ", // Subject line
      text: "Quên mật khẩu ?", // plain text body
      html: html, // html body
    });
    return info
  
}