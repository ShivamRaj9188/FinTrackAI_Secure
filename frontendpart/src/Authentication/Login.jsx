import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import loginImage from '../assets/images/login.jpg';
import { login } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Check for deactivated account error from Google auth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam === 'deactivated') {
      setError('Your account has been deactivated. Please contact admin@fintrackai.com or support team to reactivate your account.');
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Store auth token
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userEmail', email);
        
        // Store user info for immediate access
        if (result.user) {
          localStorage.setItem('userInfo', JSON.stringify({
            name: result.user.name,
            email: result.user.email,
            id: result.user.id
          }));
        }
        
        // Dispatch custom event to notify Header component
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('userLogin'));
        }, 100);
        
        // Check for redirect parameters
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        const plan = urlParams.get('plan');
        
        if (redirect === 'pricing' && plan === 'pro') {
          navigate('/pricing');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100">
      <Header />
      <div className="py-6">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold text-blue-600 bg-clip-text pb-3">Sign In</h1>
          <p className="text-sm mt-2 text-blue-500">Home &gt; Sign In</p>
        </div>
      </div>

      <div className="flex justify-center mt-10 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden flex max-w-4xl w-full">
          <div className="hidden md:block w-1/2">
            <img
              src={loginImage}
              alt="Person working on a laptop at a desk in a bright modern workspace, conveying a focused and welcoming atmosphere"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-600 mb-6">Fill your email and password to sign in.</p>

            {error && (
              <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form id="loginForm" onSubmit={handleSubmit}>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  id="togglePassword"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="text-sm mt-4 text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600">
                Sign up?
              </Link>{' '}
              <Link to="/admin" className="text-blue-600 ml-2">
                Admin
              </Link>
            </p>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 text-gray-400">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <div className="flex justify-center">
              <a 
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google`}
                className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  // Store the current URL to return to after login
                  localStorage.setItem('loginRedirectUrl', window.location.href);
                }}
              >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div id="footer"></div>
      <Footer />
    </div>
  );
};

export default Login;