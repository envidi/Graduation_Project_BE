import asyncHandler from 'express-async-handler'
import { sendEmailService } from '../utils/sendMail'

export const sendMailController = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (email) {
    const response = await sendEmailService(email)
    return res.status(200).json({
      message: response ? 'Gửi mail thành công' : 'Gửi mail thất bại',
      response
    })
  }

  return res.status(400).json({
    message: 'Gửi mail thất bại'
  })
})
