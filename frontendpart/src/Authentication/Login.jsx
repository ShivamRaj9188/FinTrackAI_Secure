import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result.success) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userInfo', JSON.stringify(result.user));
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-secondary)] rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl animate-scale-in">

        {/* Left — Visual Panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#111] to-[#0A0A0A] border-r border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5 mb-12">
              <div className="w-9 h-9 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-sm">F</span>
              </div>
              <span className="text-lg font-extrabold text-white">FinTrackAI</span>
            </Link>

            <h2 className="text-3xl font-black text-white leading-snug mb-4">
              Welcome back to<br />
              <span className="gradient-text">smarter finance.</span>
            </h2>
            <p className="text-sm text-[#555] max-w-[260px]">
              Your AI-powered financial dashboard is waiting with fresh insights.
            </p>
          </div>

          {/* Mini Chart Visual */}
          <div className="relative z-10 my-8">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-[#444] tracking-widest uppercase">Weekly Spending</span>
                <span className="text-xs font-bold text-[var(--accent-primary)]">-12%</span>
              </div>
              <style>{`
                @keyframes loginBarGrow {
                  from { transform: scaleY(0); }
                  to { transform: scaleY(1); }
                }
              `}</style>
              <div className="flex items-end gap-2 h-20">
                {[40, 65, 35, 80, 50, 70, 45].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/[0.04] rounded-md overflow-hidden relative" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 left-0 w-full rounded-md"
                      style={{
                        height: `${h}%`,
                        background: 'linear-gradient(to top, #00d1b2, #00d1ff)',
                        opacity: 0.65,
                        transformOrigin: 'bottom',
                        animation: `loginBarGrow 0.8s ease-out ${0.3 + i * 0.08}s both`
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[8px] font-bold text-[#333]">{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative z-10 pt-6 border-t border-white/5">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(i => (
                <i key={i} className="fas fa-star text-yellow-400 text-[10px]"></i>
              ))}
            </div>
            <p className="text-sm text-[#888] font-medium mb-2">
              "FinTrackAI helped me save ₹15,000 in the first month by identifying unnecessary subscriptions."
            </p>
            <p className="text-[10px] font-bold text-[#444] uppercase tracking-wider">
              Rahul M. • Software Engineer
            </p>
          </div>

          {/* Decorative */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.05] blur-[120px]"></div>
        </div>

        {/* Right — Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-sm">F</span>
              </div>
              <span className="text-lg font-extrabold text-white">FinTrackAI</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
          <p className="text-sm text-[#555] mb-8">Enter your credentials to access your dashboard</p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 animate-fade-in">
              <i className="fas fa-exclamation-circle text-red-400 text-sm"></i>
              <span className="text-red-400 text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="section-label block mb-2">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                className="input-field w-full"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="section-label">Password</label>
                <a href="#" className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline uppercase tracking-wider">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field w-full pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-4 rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  SIGNING IN...
                </span>
              ) : 'SIGN IN'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-[10px] font-bold text-[#333] tracking-widest">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
              }}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.03] border border-white/[0.06] py-3.5 rounded-2xl text-sm font-semibold transition-all text-[#888] hover:bg-white/[0.06] hover:text-white"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
              Google Account
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[#444]">
            New to FinTrackAI?{' '}
            <Link to="/signup" className="text-white font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;