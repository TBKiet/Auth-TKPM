const { google } = require('googleapis');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleUser = require('../models/google-user.model');

// Get the appropriate redirect URI based on environment
const getRedirectUri = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_REDIRECT_URI_PROD
    : process.env.GOOGLE_REDIRECT_URI_DEV;
};

// Check if environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing Google OAuth2 environment variables. Please check your .env file.');
  console.log('Current environment variables:', {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing'
  });
  process.exit(1);
}

const redirectUri = getRedirectUri();
console.log('Google OAuth2 Configuration:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Redirect URI:', redirectUri);
console.log('Environment:', process.env.NODE_ENV);

// Configure Google OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

// Configure YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});

// Configure Passport Google Strategy with specific requirements
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: redirectUri,
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube.upload',
      'openid'
    ],
    accessType: 'offline',
    prompt: 'consent',
    response_type: 'code'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth2 Profile:', profile);
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);

      // Find or create user in MongoDB
      let user = await GoogleUser.findOne({ googleId: profile.id });

      if (!user) {
        // Create new user
        user = new GoogleUser({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          accessToken,
          refreshToken,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            scope: profile._json.scope,
            token_type: 'Bearer',
            expiry_date: Date.now() + 3600000 // 1 hour from now
          }
        });
      } else {
        // Update existing user's tokens
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.tokens = {
          access_token: accessToken,
          refresh_token: refreshToken,
          scope: profile._json.scope,
          token_type: 'Bearer',
          expiry_date: Date.now() + 3600000
        };
      }

      // Save user to MongoDB
      await user.save();
      
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth2 Error:', error);
      return done(error, null);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await GoogleUser.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = {
  oauth2Client,
  youtube,
  passport
}; 