const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Automatically delete documents after 1 hour
  }
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema); 