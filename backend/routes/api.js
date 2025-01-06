// routes/api.js
import express from 'express';
import multer from 'multer';
import {uploadAudio} from '../controllers/apiController.js';
import { testEndpoint } from '../controllers/apiController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('audio/')) {
              cb(null, true); // Accept audio files
            } else {
              cb(new Error('Only audio files are allowed!'), false); // Reject non-audio files
            }
          }
    }
});

// Test API Endpoint
router.get('/test', testEndpoint);
  
  // Audio Upload Route
  router.post('/upload-audio', upload.single('audio'), uploadAudio)

export default router;