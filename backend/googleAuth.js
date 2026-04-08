const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// Use the existing User model
const User = require('./authentication/User');

// Initialize Google Strategy - use BACKEND_URL env var or stable production domain
// IMPORTANT: Do NOT use VERCEL_URL — it gives deployment-specific URLs that won't match Google Console
const getCallbackURL = () => {
  // Always prioritize BACKEND_URL if explicitly set in environment
  if (process.env.BACKEND_URL) {
    const backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
    return `${backendUrl}/api/auth/google/callback`;
  }

  // Fallback for development or if BACKEND_URL is missing
  if (process.env.NODE_ENV === 'production') {
    // If we're in production but missing BACKEND_URL, we're in a risky state.
    // We'll use the provided stable domain as a last resort, but warn about it.
    const fallbackUrl = 'https://fintrackai-api.vercel.app'; 
    return `${fallbackUrl}/api/auth/google/callback`;
  }

  return 'http://localhost:8000/api/auth/google/callback';
};

const callbackURL = getCallbackURL();
console.log('Google Auth Callback URL:', callbackURL);

// Google OAuth configuration
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
          }
          return done(null, user);
        } else {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            isVerified: true,
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
} else {
  // Register a dummy strategy to prevent "Unknown authentication strategy" error
  // but it will fail gracefully if actually called
  passport.use('google', new GoogleStrategy({
      clientID: 'dummy',
      clientSecret: 'dummy',
      callbackURL: 'http://localhost/dummy'
    }, (at, rt, p, done) => done(new Error('Google keys missing'))));
  
  console.warn('WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found. Google Login is disabled.');
}

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