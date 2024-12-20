import express from 'express';
import { checkPAN, confirmPAN,createDigilockerUrl, getDigilockerDetails,hybridBankAccountVerification, reversePennyDropCreateLink, verifyReversePennyDrop } from '../controllers/kycController.js';
import { checkAuthUser } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/check_pan', checkAuthUser, checkPAN);
router.post('/confirm_pan', checkAuthUser, confirmPAN);
router.post('/create_digilocker_url', checkAuthUser, createDigilockerUrl);
router.post('/get_digilocker_details', checkAuthUser, getDigilockerDetails);
router.post('/hybrid_bank_account_verification', checkAuthUser, hybridBankAccountVerification);
router.post('/reverse_penny_drop_create_link', checkAuthUser, reversePennyDropCreateLink);
router.post('/verify_reverse_penny_drop', checkAuthUser, verifyReversePennyDrop);

 
export default router;     