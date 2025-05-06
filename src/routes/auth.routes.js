const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const TokenBlacklist = require('../models/token-blacklist.model');
const { checkBlacklist } = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const PasswordReset = require('../models/password-reset.model');
const emailUtils = require('../utils/email.utils');
const crypto = require('crypto');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user profile
router.get('/profile', checkBlacklist, authController.getProfile);

// Logout user
router.post('/logout', checkBlacklist, async (req, res) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Add token to blacklist using userId from decoded token
    await TokenBlacklist.create({
      token: token,
      userId: req.user.userId // Use userId from decoded JWT token
    });

    res.json({
      message: 'Successfully logged out and invalidated token',
      success: true
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Error during logout',
      error: error.message
    });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Received forgot password request for email:', email);
    
    const user = await User.findOne({ email });
    console.log('User found:', !!user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated reset token');
    
    // Save reset token to database
    const passwordReset = await PasswordReset.create({
      userId: user._id,
      token: resetToken
    });
    console.log('Saved reset token to database:', !!passwordReset);

    // Send reset email
    const emailSent = await emailUtils.sendPasswordResetEmail(email, resetToken);
    console.log('Email sent result:', emailSent);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending reset email' });
    }

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find the reset token
    const resetRequest = await PasswordReset.findOne({ 
      token,
      createdAt: { $gt: new Date(Date.now() - 3600000) } // Token must be less than 1 hour old
    });
    
    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Find the user
    const user = await User.findById(resetRequest.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's password - let the User model handle hashing
    user.password = newPassword;
    await user.save();

    // Delete the used reset token
    await PasswordReset.deleteOne({ token });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router; 