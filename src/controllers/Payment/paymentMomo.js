import https from 'https'
import { momoConfig } from '../../config/Payment/momo'
import crypto from 'crypto'

// const req = https.request(options, (res) => {
//   //   console.log(`Status: ${res.statusCode}`)
//   //   console.log(`Headers: ${JSON.stringify(res.headers)}`)
//   res.setEncoding('utf8')
//   res.on('data', (body) => {
//     console.log('Body: ')
//     console.log(body)
//     // console.log('resultCode: ')
//     // console.log(JSON.parse(body).resultCode)
//   })
//   res.on('end', () => {
//     console.log('No more data in response.')
//   })
// })

// req.on('error', (e) => {
//   console.log(`problem with request: ${e.message}`)
// })
// // write data to request body
// req.write(requestBody)
// req.end()

export const createPaymentMoMo = async (req, res, next) => {
  try {
    var extraData = ''
    var amount = req.body.amount
    var orderId = momoConfig.partnerCode + new Date().getTime()
    var requestId = orderId
    var orderGroupId = ''
    var autoCapture = true
    var lang = 'vi'
    var rawSignature =
      'accessKey=' +
      momoConfig.accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      momoConfig.ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      momoConfig.orderInfo +
      '&partnerCode=' +
      momoConfig.partnerCode +
      '&redirectUrl=' +
      momoConfig.redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      momoConfig.requestType
    var signature = crypto
      .createHmac('sha256', momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex')

    const requestBody = JSON.stringify({
      partnerCode: momoConfig.partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: momoConfig.orderInfo,
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      lang: lang,
      requestType: momoConfig.requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature
    })

    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }
    const request = https.request(options, (response) => {
      let responseData = ''

      response.on('data', (chunk) => {
        responseData += chunk
      })

      response.on('end', () => {
        // Handle the response...
        const parsedResponse = JSON.parse(responseData)
        res
          .status(200)
          .json(parsedResponse.payUrl)
      })
    })

    request.on('error', (error) => {
      res.status(500).json({ error: error })
    })

    // write data to request body
    request.write(requestBody)
    request.end()
  } catch (error) {
    next(error)
  }
}
