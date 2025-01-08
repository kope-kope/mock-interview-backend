import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadAudio } from '../controllers/apiController.js';

const router = express.Router();

const uploadPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype === 'audio/mpeg' ? cb(null, true) : cb(new Error('❌ Only MP3 allowed'));
  },
});

router.post('/upload-audio', upload.single('audio'), uploadAudio);

export default router;
