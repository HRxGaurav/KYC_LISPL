import express from 'express';
import { sendMobileOTP, resendMobileOTP, verifyMobileOTP, sendEmailOTP} from '../controllers/authController.js';
import { checkLoggedIn } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/send_mobile_otp', sendMobileOTP);
router.post('/resend_mobile_otp', resendMobileOTP);
router.post('/verify_mobile_otp', verifyMobileOTP);
router.post('/send_email_otp', sendEmailOTP);

 
export default router;