import asyncHandler from 'express-async-handler'
import { sendEmailService } from '../utils/sendMail'
import { convertNumberToAlphabet } from '../utils/ToStringArray'
import { convertTimeToCurrentZone } from '../utils/timeLib'

export const sendMailController = asyncHandler(async (req, res) => {
  const { email } = req.body
  const html = `
  <html>
  <head>
  </head>
  <body style="display: flex; align-items: center; justify-content: center ; font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;   min-height: 100vh; color: #333; ">
    <table style="width: 100%; max-width: 600px; background-color: #fff; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;  ">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <h1 style="color: #dc143c; margin-bottom: 20px;">Your Ticket</h1>
          <p style="margin: 0;">Thank you for your purchase. Here are the details of your ticket:</p>
        </td>
      </tr>
      <tr>
        <td style=" text-align:center; padding: 20px; border-top: 1px solid #eee; ">
          <h2 style="color: #333; margin-bottom: 15px;">Event Details</h2>
          <p style="margin: 0; font-size: 16px;">Event: Concert Name</p>
          <p style="margin: 0; font-size: 16px;">Date: January 1, 2024</p>
          <p style="margin: 0; font-size: 16px;">Location: Venue Name</p>
        </td>
      </tr>
      <tr>
        <td style= " text-align:center; padding: 20px; border-top: 1px solid #eee;">
          <h2 style="color: #333; margin-bottom: 15px;">Ticket Information</h2>
          <p style="margin: 0; font-size: 16px;">Seat: Block 406, Row Q, Seats 34-35</p>
          <p style="margin: 0; font-size: 16px;">Type: Level 1 VIP Club Seats and Bar</p>
        </td>
      </tr>
      <tr>
        <td style= "text-align:center; padding: 20px; border-top: 1px solid #eee;">
          <h2 style="color: #333; margin-bottom: 15px;">Delivery Address</h2>
          <p style="margin: 0; font-size: 16px;">8 Joanne Lane, 2516 AC Den Haag</p>
          <p style="margin: 0; font-size: 16px;">Netherlands</p>
        </td>
      </tr>
      <tr>
        <td style= "text-align:center; padding: 20px; border-top: 1px solid #eee;">
          <h2 style="color: #333; margin-bottom: 15px;">Payment Method</h2>
          <p style="margin: 0; font-size: 16px;">Mastercard **** 8765</p>
        </td>
      </tr>
      <tr>
        <td style= "text-align:center; padding: 20px; border-top: 1px solid #eee;">
          <h2 style="color: #333; margin-bottom: 15px;">Total Paid</h2>
          <p style="margin: 0; font-size: 16px; color: #dc143c; font-weight: bold;">£173.20</p>
        </td>
      </tr>
    </table>
  </body>
</html>

  

  `
  const data = {
    email: email,
    html
  }
  if (email) {
    const response = await sendEmailService(data)
    return res.status(200).json({
      message: response ? 'Gửi mail thành công' : 'Gửi mail thất bại',
      response
    })
  }

  return res.status(400).json({
    message: 'Gửi mail thất bại'
  })
})
export const sendMailTicket = asyncHandler(async (req) => {
  const {
    _id,
    email,
    seatId,
    movieName,
    screenName,
    typeBank,
    foods,
    showtimeTimeFrom,
    cinemaId,
    quantityTicket,
    totalPrice,
    date
  } = req.body
  const seats = seatId
    .map((seat) => {
      return `${convertNumberToAlphabet(seat.row)}${seat.column}(${
        seat.typeSeat
      })`
    })
    .join(', ')
  const foodsTicket = foods
    .map((food) => {
      return `${food.name}(${food.quantityFood})`
    })
    .join(', ')
  const html = `
  <html>
  <head>
  </head>
  <body style="display: flex; align-items: center; justify-content: center ; font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;   min-height: 100vh; color: #333; ">
    <table style="width: 100%; max-width: 600px; background-color: #fff; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;  ">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <h1 style="color: #dc143c; margin-bottom: 20px;">Vé của bạn</h1>
          <p style="margin: 0;">Cám ơn bạn đã lựa chọn DreamCinema. Dưới đây là thông tin vé của bạn:</p>
        </td>
      </tr>
      <tr>
        <td style=" text-align:center; padding: 20px; border-top: 1px solid #eee; ">
          <h2 style="color: #333; margin-bottom: 15px;">Thông tin rạp chiếu</h2>
          <p style="margin: 0; font-size: 16px;">Rạp: ${cinemaId.CinemaName}</p>
          <p style="margin: 0; font-size: 16px;">Địa điểm: ${cinemaId.CinemaAdress}</p>
        </td>
      </tr>
      <tr>
        <td style= " text-align:center; padding: 20px; border-top: 1px solid #eee;">
          <h2 style="color: #333; margin-bottom: 15px;">Thông tin vé</h2>
          <p style="margin: 0; font-size: 16px;">ID vé: ${_id}</p>
          <p style="margin: 0; font-size: 16px;">Số lượng vé: ${quantityTicket}</p>
          <p style="margin: 0; font-size: 16px;">Tên phim: ${movieName}</p>
          <p style="margin: 0; font-size: 16px;">Phòng chiếu: ${screenName}</p>
          <p style="margin: 0; font-size: 16px;">Giờ chiếu: ${new Date(showtimeTimeFrom).getHours()}:${new Date(showtimeTimeFrom).getMinutes()}</p>
          <p style="margin: 0; font-size: 16px;">Ghế: ${seats}</p>
          <p style="margin: 0; font-size: 16px;">Đồ ăn: ${foodsTicket}</p>
        </td>
      </tr>
      <tr>
      <td style= " text-align:center; padding: 20px; border-top: 1px solid #eee;">
        <h2 style="color: #333; margin-bottom: 15px;">Thông tin thanh toán</h2>
        <p style="margin: 0; font-size: 16px;">Phương thức thanh toán: ${typeBank}</p>
        <p style="margin: 0; font-size: 16px;">Ngày thanh toán: ${convertTimeToCurrentZone(date)}</p>
       
      </td>
    </tr>
      <tr>
        <td style= "text-align:center; padding: 20px; border-top: 1px solid #eee;">
          <h2 style="color: #333; margin-bottom: 15px;">Tổng tiền</h2>
          <p style="margin: 0; font-size: 16px; color: #dc143c; font-weight: bold;"> ${totalPrice.toLocaleString('it-IT', { style : 'currency', currency : 'VND' })}</p>
        </td>
      </tr>
    </table>
  </body>
</html>

  

  `
  const data = {
    email: email,
    html
  }
  if (email) {
    await sendEmailService(data)
  }
})
