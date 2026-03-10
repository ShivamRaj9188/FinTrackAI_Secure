// Test Google Auth Configuration
const testGoogleAuth = () => {
  console.log('🔍 Google Auth Configuration:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERCEL_URL:', process.env.VERCEL_URL);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
  
  const callbackURL = process.env.NODE_ENV === 'production'
    ? (process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api/auth/google/callback`
        : 'https://your-backend.vercel.app/api/auth/google/callback')
    : 'http://localhost:8000/api/auth/google/callback';
    
  console.log('Callback URL:', callbackURL);
};

module.exports = { testGoogleAuth };