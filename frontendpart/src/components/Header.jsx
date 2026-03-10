import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-slate-900">FinTrackAI</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-slate-600 hover:text-blue-600">Features</Link>
            <Link to="/pricing" className="text-slate-600 hover:text-blue-600">Pricing</Link>
            <Link to="/about" className="text-slate-600 hover:text-blue-600">About</Link>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
          <button onClick={toggleMenu} className="md:hidden text-slate-700 text-xl">
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4">
          <div className="flex flex-col space-y-3">
            <Link to="/features" className="block py-2 text-slate-600 hover:text-blue-600">Features</Link>
            <Link to="/pricing" className="block py-2 text-slate-600 hover:text-blue-600">Pricing</Link>
            <Link to="/about" className="block py-2 text-slate-600 hover:text-blue-600">About</Link>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;