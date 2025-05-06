const mongoose = require('mongoose');

const googleUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  tokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Update lastLogin timestamp before saving
googleUserSchema.pre('save', function(next) {
  this.lastLogin = new Date();
  next();
});

const GoogleUser = mongoose.model('GoogleUser', googleUserSchema);

module.exports = GoogleUser; 