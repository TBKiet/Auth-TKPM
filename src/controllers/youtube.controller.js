const { youtube } = require('../config/google.config');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /mp4|mov|avi|wmv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only video files are allowed!'));
  }
}).single('video');

// Upload video to YouTube
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ message: 'Not authenticated with Google' });
    }

    const { title, description, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title,
          description,
          tags: tags ? tags.split(',') : [],
        },
        status: {
          privacyStatus: 'private' // Can be 'public', 'private', or 'unlisted'
        }
      },
      media: {
        body: req.file.buffer
      }
    });

    res.json({
      message: 'Video uploaded successfully',
      videoId: response.data.id,
      videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video', error: error.message });
  }
};

// Get upload middleware
exports.getUploadMiddleware = () => upload; 