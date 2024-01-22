import https from 'https'
import { momoConfig } from '../../config/Payment/momo'
import crypto from 'crypto'

var extraData = ''
var amount = '60000'
var orderId = momoConfig.partnerCode + new Date().getTime()
var requestId = orderId
var orderGroupId = ''
var autoCapture = true
var lang = 'vi'

var signature = crypto
  .createHmac('sha256', momoConfig.secretKey)
  .update(rawSignature)
  .digest('hex')

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
const req = https.request(options, (res) => {
//   console.log(`Status: ${res.statusCode}`)
//   console.log(`Headers: ${JSON.stringify(res.headers)}`)
  res.setEncoding('utf8')
  res.on('data', (body) => {
    console.log('Body: ')
    console.log(body)
    // console.log('resultCode: ')
    // console.log(JSON.parse(body).resultCode)
  })
  res.on('end', () => {
    console.log('No more data in response.')
  })
})

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`)
})
// write data to request body
req.write(requestBody)
req.end()
