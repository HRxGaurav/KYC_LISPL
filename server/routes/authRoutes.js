import express from 'express';
import { sendMobileOTP} from '../controllers/authController.js';
import { checkLoggedIn } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/send_mobile_otp', sendMobileOTP);

 
export default router;