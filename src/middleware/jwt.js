import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js'; 


export const AccessTokenUser = (uid, role) => {
  return jwt.sign({ _id: uid, role }, env.JWT_SECRET, { expiresIn:'3d' })
}
export const RefeshTokenUser = (uid) => {
  return jwt.sign({ _id: uid }, env.JWT_SECRET, { expiresIn:'7d' })
}