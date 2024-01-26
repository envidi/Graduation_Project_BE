import express from 'express';
import { sendMailController } from '../controllers/email';
const routerEmail = express.Router();

routerEmail.post('/', sendMailController);


export default routerEmail;
