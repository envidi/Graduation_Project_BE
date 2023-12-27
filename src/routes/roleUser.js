import express from 'express';
import {
 createRole,
 deleteRole,
 updateRole,
 getRole
} from '../controllers/roleUser.js';
// import { isAdmin, verifyAccessToken } from '../middleware/verifyToken.js';
// import { checkPermission } from "../middlewares/checkPermission";
const routerRoleUser = express.Router();

// routerProducts.get('/', verifyAccessToken, getAll);
// routerProducts.get('/:id', verifyAccessToken, getDetail);
// routerProducts.put('/:id', verifyAccessToken, isAdmin, update);
// routerProducts.post('/', verifyAccessToken, isAdmin, create);
// routerProducts.delete('/:id', verifyAccessToken, isAdmin, remove);

routerRoleUser.get('/:id', getRole);
// routerRoleUser.get('/query', getDetail);
routerRoleUser.patch('/:id', updateRole);
routerRoleUser.post('/', createRole);
routerRoleUser.delete('/:id', deleteRole);


export default routerRoleUser;
