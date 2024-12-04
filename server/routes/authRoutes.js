import express from 'express';
import { sendMobileOTP, resendMobileOTP, verifyMobileOTP, sendEmailOTP, resendEmailOTP, verifyEmailOTP} from '../controllers/authController.js';
import { checkAuthUser } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/send_mobile_otp', sendMobileOTP);
router.post('/resend_mobile_otp', checkAuthUser, resendMobileOTP);
router.post('/verify_mobile_otp', checkAuthUser, verifyMobileOTP);
router.post('/send_email_otp', checkAuthUser,  sendEmailOTP);
router.post('/resend_email_otp', checkAuthUser, resendEmailOTP);
router.post('/verify_email_otp', checkAuthUser, verifyEmailOTP);

 
export default router;