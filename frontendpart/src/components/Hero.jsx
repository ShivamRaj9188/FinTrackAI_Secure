import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const metrics = [
    { label: 'Active Users', value: '50K+', icon: 'fa-users' },
    { label: 'Analyzed', value: '₹2Cr+', icon: 'fa-chart-line' },
    { label: 'AI Insights', value: '1M+', icon: 'fa-brain' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0A0A0A]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}></div>

      {/* Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent-primary)] opacity-[0.06] blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-secondary)] opacity-[0.06] blur-[150px] rounded-full"></div>
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-purple-500 opacity-[0.04] blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left — Copy */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-secondary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-secondary)]"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-[#888]">AI-POWERED FINANCIAL ENGINE</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white mb-6">
              Your Money,{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Decoded by AI.</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg text-[#888] leading-relaxed max-w-lg mb-10">
              Upload your bank statements. Get instant AI-powered spending analysis, smart categorization, and personalized insights to grow your wealth.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <button className="btn-primary w-full sm:w-auto px-8 py-4 text-[13px] rounded-2xl shadow-2xl shadow-white/5">
                  <i className="fas fa-bolt text-xs"></i>
                  START FREE — NO CARD NEEDED
                </button>
              </Link>
              <Link to="/features">
                <button className="btn-secondary w-full sm:w-auto px-8 py-4 text-[13px] rounded-2xl">
                  <i className="fas fa-play text-[10px]"></i>
                  SEE HOW IT WORKS
                </button>
              </Link>
            </div>

            {/* Trust Bar */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/5">
              {[
                { icon: 'fa-lock', label: 'Bank-grade Encryption' },
                { icon: 'fa-shield-alt', label: 'SOC2 Compliant' },
                { icon: 'fa-bolt', label: 'Real-time Analysis' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-[#555]">
                  <i className={`fas ${item.icon} text-[var(--accent-primary)] text-[10px]`}></i>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview Card */}
          <div className="relative animate-fade-in-right delay-200">
            {/* Main Card */}
            <div className="relative z-10 glow-card p-8 rounded-3xl">
              {/* Card Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="section-label mb-1">Monthly Overview</p>
                  <p className="text-3xl font-black text-white">₹1,42,850</p>
                </div>
                <div className="badge badge-success">
                  <i className="fas fa-arrow-up text-[8px]"></i>
                  +12.4%
                </div>
              </div>

              {/* Animated Bar Chart */}
              <style>{`
                @keyframes barGrow {
                  from { transform: scaleY(0); }
                  to { transform: scaleY(1); }
                }
              `}</style>
              <div className="flex items-end gap-2.5 h-40 mb-8">
                {[35, 65, 45, 85, 55, 75, 90].map((h, i) => (
                  <div key={i} className="flex-1 relative rounded-lg overflow-hidden bg-white/[0.04]" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 left-0 w-full rounded-lg"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, #00d1ff, #00ff94)`,
                        opacity: 0.7,
                        transformOrigin: 'bottom',
                        animation: `barGrow 1s ease-out ${0.5 + i * 0.1}s both`
                      }}
                    ></div>
                  </div>
                ))}
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center">
                    <i className={`fas ${m.icon} text-[var(--accent-primary)] text-xs mb-2 block`}></i>
                    <p className="text-sm font-bold text-white">{m.value}</p>
                    <p className="text-[9px] font-semibold text-[#555] uppercase tracking-wider mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[var(--accent-primary)] opacity-[0.08] blur-[60px] rounded-full animate-glow-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[var(--accent-secondary)] opacity-[0.08] blur-[60px] rounded-full animate-glow-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;