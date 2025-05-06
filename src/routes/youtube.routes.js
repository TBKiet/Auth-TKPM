const express = require('express');
const router = express.Router();
const { passport } = require('../config/google.config');
const youtubeController = require('../controllers/youtube.controller');
const TokenBlacklist = require('../models/token-blacklist.model');
const { checkBlacklist } = require('../middleware/auth.middleware');

// Custom middleware for YouTube authentication
const requireGoogleAuth = (req, res, next) => {
  if (!req.user || !req.user.accessToken) {
    return res.status(401).json({ message: 'Not authenticated with Google' });
  }
  next();
};

// Google OAuth2 routes with specific requirements
router.get('/auth/google',
  passport.authenticate('google', { 
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube.upload',
      'openid'
    ],
    accessType: 'offline',
    prompt: 'consent',
    response_type: 'code'
  })
);

router.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: '/api/youtube/auth/failure'
    })(req, res, next);
  },
  (req, res) => {
    // Check for specific OAuth errors
    if (req.query.error === 'access_denied') {
      return res.redirect('/api/youtube/auth/consent-error');
    }
    res.redirect('/api/youtube/auth/success');
  }
);

// Logout route with token blacklisting
router.get('/auth/logout', requireGoogleAuth, async (req, res) => {
  try {
    console.log('Logout request user:', req.user);
    
    // Add tokens to blacklist
    if (req.user.accessToken) {
      console.log('Adding token to blacklist:', {
        token: req.user.accessToken,
        userId: req.user._id
      });
      
      await TokenBlacklist.create({
        token: req.user.accessToken,
        userId: req.user._id
      });
      
      console.log('Token added to blacklist');
    }

    // Clear the session
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          message: 'Error during logout',
          error: err.message
        });
      }
      
      res.json({
        message: 'Successfully logged out and invalidated tokens',
        success: true
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Error during logout',
      error: error.message
    });
  }
});

// OAuth success and failure routes
router.get('/auth/success', (req, res) => {
  if (!req.user) {
    return res.redirect('/api/youtube/auth/failure');
  }
  res.json({
    message: 'Successfully authenticated with Google',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    },
    tokens: {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken
    }
  });
});

router.get('/auth/failure', (req, res) => {
  res.status(401).json({
    message: 'Failed to authenticate with Google',
    error: req.query.error,
    error_description: req.query.error_description
  });
});

// Consent screen error route
router.get('/auth/consent-error', (req, res) => {
  res.status(403).json({
    message: 'OAuth Consent Screen Error',
    error: 'access_denied',
    solution: 'Please contact the developer to be added as a test user for this application.',
    developer_email: 'your-email@example.com'
  });
});

// Check authentication status
router.get('/auth/status', requireGoogleAuth, checkBlacklist, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    },
    tokens: {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken
    }
  });
});

// YouTube upload route
router.post('/upload',
  requireGoogleAuth,
  checkBlacklist,
  youtubeController.getUploadMiddleware(),
  youtubeController.uploadVideo
);

module.exports = router; 