import { Router } from 'express';
import auth from './../middlewares/auth.js';
import { addAddressController } from './../controllers/address.controller';

const addressRouter = Router();

addressRouter.post('/add', auth, addAddressController)

export default addressRouter;