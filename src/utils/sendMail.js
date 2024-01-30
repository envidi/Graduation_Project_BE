import nodemailer from 'nodemailer';
import { env } from '../config/environment.js'
import dotenv from 'dotenv'
dotenv.config()

export const sendEmailService = async (email) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });


  let info = await transporter.sendMail({
    from: '"Đặt lịch xem phim thành công 👻" nguyenthanhnamcao392003@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>' // html body
  });
  return info

}