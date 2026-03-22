import React from 'react';

const features = [
  {
    title: 'AI Categorization',
    description: 'Neural AI auto-classifies every transaction into meaningful spending categories.',
    icon: 'fa-wand-magic-sparkles',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    title: 'Spending Insights',
    description: 'Get monthly patterns, anomaly detection, and personalized budget recommendations.',
    icon: 'fa-chart-pie',
    accent: 'from-emerald-500 to-green-400',
  },
  {
    title: 'Bank-Grade Security',
    description: 'End-to-end encryption, JWT auth, rate limiting, and input sanitization on every request.',
    icon: 'fa-shield-halved',
    accent: 'from-purple-500 to-violet-400',
  },
  {
    title: 'Smart Alerts',
    description: 'Real-time notifications when spending spikes in a category beyond your set threshold.',
    icon: 'fa-bell',
    accent: 'from-amber-500 to-yellow-400',
  },
  {
    title: 'Multi-Format Upload',
    description: 'Upload bank statements in PDF or CSV. Our parser handles major bank formats automatically.',
    icon: 'fa-cloud-arrow-up',
    accent: 'from-rose-500 to-pink-400',
  },
  {
    title: 'Exportable Reports',
    description: 'Download your financial analysis as CSV or print-ready PDF for tax and audit purposes.',
    icon: 'fa-file-export',
    accent: 'from-indigo-500 to-blue-400',
  },
];

const Features = () => (
  <section id="features" className="py-28 bg-[#0A0A0A] relative overflow-hidden">
    {/* Subtle bg glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)] opacity-[0.03] blur-[200px] rounded-full"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Section Header */}
      <div className="text-center mb-20 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full mb-6">
          <span className="text-[10px] font-semibold tracking-wider text-[#666]">PLATFORM CAPABILITIES</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5">
          Everything You Need to{' '}
          <span className="gradient-text">Master Your Money</span>
        </h2>
        <p className="text-lg text-[#666] max-w-2xl mx-auto leading-relaxed">
          Professional financial tools powered by neural intelligence. From automatic categorization to AI-driven recommendations.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="group cashmate-card hover:border-white/10 relative overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Hover gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 bg-white/[0.04] border border-white/[0.06] group-hover:border-white/10 transition-all">
                <i className={`fas ${f.icon} text-base text-[var(--accent-primary)] group-hover:text-white transition-colors`}></i>
              </div>

              <h3 className="text-base font-bold text-white mb-3 tracking-wide">
                {f.title}
              </h3>
              <p className="text-sm text-[#666] leading-relaxed">
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;