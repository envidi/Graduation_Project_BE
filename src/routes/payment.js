import express from 'express';
import { createPayment, returnResultPayment } from '../controllers/Payment/paymentVnPay.js';

// import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerPayment = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

// routerPayment.get('/', getAll);
// routerPayment.get('/:id', getDetail);
// routerPayment.patch('/:id', update);
routerPayment.post('/vnpay/create_payment_url', createPayment);
routerPayment.get('/vnpay/vnpay_return', returnResultPayment);
// routerPayment.delete('/:id', remove);


export default routerPayment;
