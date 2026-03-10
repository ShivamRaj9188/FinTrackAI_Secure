import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeNewsletter } from '../api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await subscribeNewsletter({ email: email.trim().toLowerCase() });
      
      if (result.success) {
        setMessage('Successfully subscribed to newsletter! 🎉');
        setEmail('');
      } else {
        setMessage(result.message || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setMessage(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold">FinTrackAI</span>
            </div>
            <p className="text-slate-400 mb-6">
              Empowering financial decisions with AI-powered insights and smart categorization.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-6">Product</h4>
            <ul className="space-y-3 text-slate-400">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>

            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-6">Support</h4>
            <ul className="space-y-3 text-slate-400">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-6">Stay Updated</h4>
            <p className="text-slate-400 mb-4">
              Get the latest updates on new features and financial insights.
            </p>
            {message && (
              <div className={`text-sm mb-3 p-2 rounded-lg transition-all duration-300 ${
                message.includes('Success') || message.includes('🎉') 
                  ? 'text-green-400 bg-green-400/10 border border-green-400/20' 
                  : 'text-red-400 bg-red-400/10 border border-red-400/20'
              }`}>
                {message}
              </div>
            )}
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
              <button 
                type="submit"
                disabled={loading || !email}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[50px]"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-arrow-right"></i>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm text-center">
            © 2025 FinTrackAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;