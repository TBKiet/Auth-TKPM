// Load environment variables first
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth.routes');
const youtubeRoutes = require('./routes/youtube.routes');
const { passport } = require('./config/google.config');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());

// Configure session based on environment
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
};

// For testing, use a memory store
if (process.env.NODE_ENV === 'test') {
  const MemoryStore = require('memorystore')(session);
  sessionConfig.store = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Root route handler
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Authentication API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/youtube', youtubeRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Connect to database when deployed
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Start the server
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app; 