//index.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import { logger } from './middleware/logger.js';




const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

  

// Test Route
app.get('/', (req, res) => {
  res.send('Hello from the Mock Interview Backend!');
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: '❌ File size exceeds the allowed limit (50MB). Please upload a smaller file.'
      });
    }
  
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        error: `❌ Multer error: ${err.message}`
      });
    }
  
    console.error('Unexpected Error:', err.message);
    res.status(500).json({
      error: '❌ An unexpected error occurred on the server.'
    });
  });

// Start the Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
