import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { adminLogin } from '../api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both admin email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid admin email.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await adminLogin({ email, password });
      
      if (result.success) {
        // Store admin auth token
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userInfo', JSON.stringify({
          email: email,
          role: 'admin'
        }));
        
        // Redirect to admin dashboard
        navigate('/admin-dashboard');
      } else {
        setError(result.message || 'Admin login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Admin login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100">
      <Header />
      <div className="py-6">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold text-blue-600 bg-clip-text pb-3">Admin Login</h1>
          <p className="text-sm mt-2 text-blue-500">Home &gt; Admin Sign In</p>
        </div>
      </div>

      <div className="flex justify-center mt-10 px-4 mb-10">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md w-full">
          {/* Centered Form */}
          <div className="p-8">
            {/* Admin Badge */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                Administrator Access
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-2 text-gray-900 text-center">Welcome Back, Admin!</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">Please sign in to access the admin dashboard.</p>

            {error && (
              <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                id="email"
                type="email"
                placeholder="Admin Email"
                className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Admin Password"
                  className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In as Admin'}
              </button>
            </form>



            <p className="text-sm mt-4 text-center">
              Need user access?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Switch to User Login
              </Link>
            </p>

         

           
          </div>
        </div>
      </div>
      <div id="footer"></div>
      <Footer />
    </div>
  );
};

export default AdminLogin;