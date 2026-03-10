import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import loginImage from '../assets/images/login.jpg';
import { register } from '../api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await register({ 
        name, 
        email, 
        password 
      });
      
      if (result.success) {
        // Store auth token
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userEmail', email);
        
        // Store user info for immediate access
        if (result.user) {
          localStorage.setItem('userInfo', JSON.stringify({
            name: result.user.name || name,
            email: result.user.email || email
          }));
        }
        
        // Dispatch custom event to notify Header component
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('userLogin'));
        }, 100);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100">
      <Header />
      <div className="py-6">
        <div className="text-center text-white">
          <h1 className="text-3xl text-blue-600 font-bold">Sign Up</h1>
          <p className="text-sm mt-2 text-blue-500">Home &gt; Sign Up</p>
        </div>
      </div>

      <div className="flex justify-center mt-10 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden flex max-w-4xl w-full">
          <div className="hidden md:block w-1/2">
            <img src={loginImage} alt="Laptop" className="h-full w-full object-cover" />
          </div>

          <div className="w-full md:w-1/2 p-8">
            {error && (
              <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            <form id="loginForm" onSubmit={handleSubmit}>
              <input
                id="name"
                type="text"
                placeholder="Name"
                className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative mb-4">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="relative mb-4">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  id="toggleConfirmPassword"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-sm mt-4 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600">
                Sign In?
              </Link>{' '}
              <Link to="/admin" className="text-blue-600 ml-2">
                Admin
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

export default Signup;
