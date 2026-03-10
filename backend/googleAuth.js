const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// Use the existing User model
const User = require('./authentication/User');

// Initialize Google Strategy - Fixed for Render
const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://fintrackai.onrender.com/api/auth/google/callback'
  : 'http://localhost:8000/api/auth/google/callback';

// Google OAuth configured for production

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists, update googleId if not set
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        // Set isVerified to true since Google account is verified
        if (!user.isVerified) {
          user.isVerified = true;
          await user.save();
        }
        return done(null, user);
      } else {
        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isVerified: true, // Google accounts are verified
          status: 'Active'
        });
        
        await user.save();
        return done(null, user);
      }
    } catch (error) {
      console.error('Google auth error:', error);
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
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;