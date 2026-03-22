import { useState, useEffect } from 'react';
import { scrollToTop } from '../utils/smoothScroll';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.pageYOffset > 300);
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => scrollToTop('smooth')}
      className={`fixed bottom-8 right-8 z-50 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border backdrop-blur-md ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        background: 'rgba(0, 209, 178, 0.12)',
        borderColor: 'rgba(0, 209, 178, 0.2)',
      }}
      aria-label="Scroll to top"
    >
      <i className="fas fa-arrow-up text-xs" style={{ color: 'var(--accent-primary)' }}></i>
    </button>
  );
};

export default BackToTopButton;
