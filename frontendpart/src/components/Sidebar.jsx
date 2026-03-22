import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ name: 'User', email: '' });

  useEffect(() => {
    try {
      const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (info.name || info.email) setUser({ name: info.name || 'User', email: info.email || '' });
    } catch { /* ignore parse error */ }
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: 'fa-th-large', path: '/dashboard' },
    { name: 'Transactions', icon: 'fa-arrow-right-arrow-left', path: '/transaction' },
    { name: 'Upload', icon: 'fa-cloud-arrow-up', path: '/upload' },
    { name: 'AI Insights', icon: 'fa-wand-magic-sparkles', path: '/insights' },
    { name: 'Reports', icon: 'fa-chart-column', path: '/reports' },
  ];

  const bottomItems = [
    { name: 'Profile', icon: 'fa-user', path: '/userdashboard' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const currentPath = location.pathname;

  const NavButton = ({ item }) => {
    const isActive = currentPath === item.path;
    return (
      <button
        onClick={() => {
          navigate(item.path);
          setIsOpen(false);
        }}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
          transition-all duration-200 group relative
          ${isActive
            ? 'bg-white/[0.06] text-white'
            : 'text-[#666] hover:text-[#aaa] hover:bg-white/[0.03]'}
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-r-full"></div>
        )}
        <i className={`fas ${item.icon} w-5 text-center text-sm ${isActive ? 'text-[var(--accent-primary)]' : ''}`}></i>
        <span>{item.name}</span>
        {item.name === 'AI Insights' && (
          <span className="ml-auto text-[8px] font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black px-1.5 py-0.5 rounded-full">AI</span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center text-white bg-[var(--bg-secondary)] border border-white/[0.06] rounded-xl shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-sm`}></i>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40
        w-[var(--sidebar-width)] bg-[#0A0A0A] border-r border-white/[0.04]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full px-4 py-6">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 mb-8 px-2 cursor-pointer group"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-black font-black text-xs">F</span>
            </div>
            <span className="text-base font-extrabold text-white tracking-tight">
              FinTrack<span className="gradient-text">AI</span>
            </span>
          </div>

          {/* Main Nav */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            <p className="section-label px-3 mb-3">NAVIGATION</p>
            {menuItems.map(item => <NavButton key={item.name} item={item} />)}

            <div className="h-px bg-white/[0.04] my-4 mx-2"></div>

            <p className="section-label px-3 mb-3">ACCOUNT</p>
            {bottomItems.map(item => <NavButton key={item.name} item={item} />)}
          </nav>

          {/* User & Logout */}
          <div className="pt-4 border-t border-white/[0.04] space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-white/[0.06] flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#555] truncate">{user.email}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#555] hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              <i className="fas fa-arrow-right-from-bracket w-5 text-center text-sm"></i>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
