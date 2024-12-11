import express from 'express';
import { checkPAN, confirmPAN } from '../controllers/kycController.js';
import { checkAuthUser } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/check_pan', checkAuthUser, checkPAN);
router.post('/confirm_pan', checkAuthUser, confirmPAN);

 
export default router;  