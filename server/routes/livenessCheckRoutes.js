import express from 'express';
import multer from 'multer';
import { validateVideo } from './videoValidator.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/liveness-check', upload.single('video'), async (req, res) => {
  const videoPath = req.file.path;
  const spokenNumber = req.body.spokenNumber;

  // Validate the video (check for liveness, single person, etc.)
  const isValid = await validateVideo(videoPath, spokenNumber);

  if (isValid) {
    return res.json({ message: 'Liveness check passed!' });
  } else {
    return res.status(400).json({ message: 'Liveness check failed.' });
  }
});

export default router;