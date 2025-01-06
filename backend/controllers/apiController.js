// controllers/apiController.js
export const testEndpoint = (req, res) => {
    res.json({ message: 'This is a test endpoint!' });
  };

  // controllers/apiController.js
  
  export const uploadAudio = (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }
  
      console.log('Uploaded File:', {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
  
      res.status(200).json({
        message: '✅ Audio file uploaded successfully',
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    } catch (error) {
      console.error('Error uploading audio:', error);
      res.status(500).json({ error: 'Failed to upload audio file' });
    }
  };
  
  