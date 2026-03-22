import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-[var(--sidebar-width)] transition-all duration-300">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/[0.04] px-4 lg:px-10 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#555] hover:text-white hover:bg-white/[0.06] transition-all" aria-label="Notifications">
              <i className="fas fa-bell text-sm"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto p-4 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
