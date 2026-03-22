import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Features', 'Pricing', 'About'];

  return (
    <nav
      id="main-nav"
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="FinTrackAI Home">
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-black font-black text-sm">F</span>
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              FinTrack<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(item => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="px-4 py-2 text-[13px] font-semibold text-[#888] hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {item}
              </Link>
            ))}

            <div className="w-px h-5 bg-white/10 mx-3"></div>

            <Link
              to="/login"
              className="px-4 py-2 text-[13px] font-semibold text-[#888] hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="ml-2 bg-white text-black px-5 py-2.5 rounded-xl text-[13px] font-bold hover:scale-105 hover:shadow-lg hover:shadow-white/10 active:scale-95 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-white rounded-lg hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5 animate-slide-down">
          <div className="px-6 py-6 space-y-1">
            {navLinks.map(item => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-[#888] hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                {item}
              </Link>
            ))}

            <div className="h-px bg-white/5 my-3"></div>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-[#888] hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="block bg-white text-black px-4 py-3 rounded-xl text-sm font-bold text-center mt-3"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;