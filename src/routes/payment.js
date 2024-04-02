import express from 'express';
import { createPayment, returnResultPayment } from '../controllers/Payment/paymentVnPay.js';
import { createPaymentMoMo } from '../controllers/Payment/paymentMomo.js';
import { getAll } from '../controllers/Payment/payment.js';

// import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerPayment = express.Router();


routerPayment.get('/all', getAll);
routerPayment.post('/vnpay/create_payment_url', createPayment);
routerPayment.post('/momo/create_payment_url', createPaymentMoMo);
routerPayment.get('/vnpay/vnpay_return', returnResultPayment);
// routerPayment.delete('/:id', remove);


export default routerPayment;
