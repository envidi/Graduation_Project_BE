import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const { JWT_SECRET } = process.env

export const AccessTokenUser = (uid, role) => {
  return jwt.sign({ _id: uid, role }, JWT_SECRET, { expiresIn:'3d' })
}
export const RefeshTokenUser = (uid) => {
  return jwt.sign({ _id: uid }, JWT_SECRET, { expiresIn:'7d' })
}