import express from 'express';
import { checkPAN, confirmPAN,createDigilockerUrl, getDigilockerDetails } from '../controllers/kycController.js';
import { checkAuthUser } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/check_pan', checkAuthUser, checkPAN);
router.post('/confirm_pan', checkAuthUser, confirmPAN);
router.post('/create_digilocker_url', checkAuthUser, createDigilockerUrl);
router.post('/get_digilocker_details', checkAuthUser, getDigilockerDetails);

 
export default router;  