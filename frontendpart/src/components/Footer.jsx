import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'AI Insights', to: '/insights' },
    ],
    Company: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Help Center', to: '/help' },
    ],
    Legal: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-xs">F</span>
              </div>
              <span className="text-base font-extrabold text-white">FinTrackAI</span>
            </Link>
            <p className="text-sm text-[#555] leading-relaxed max-w-[240px]">
              AI-powered financial intelligence for smarter money decisions.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-[10px] font-bold text-[#555] tracking-[0.15em] uppercase mb-5">{category}</h4>
              <ul className="space-y-3">
                {items.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#666] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#444]">
            © {currentYear} FinTrackAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: 'fa-brands fa-github', href: '#' },
              { icon: 'fa-brands fa-twitter', href: '#' },
              { icon: 'fa-brands fa-linkedin', href: '#' },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#555] hover:text-white hover:border-white/10 transition-all"
                aria-label={`Social link ${i + 1}`}
              >
                <i className={`${social.icon} text-sm`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;