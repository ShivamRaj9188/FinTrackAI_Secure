import React from 'react';

const features = [
  {
    title: 'Google + JWT Authentication',
    description: 'Secure sign-in with email/password JWT auth plus additive Google OAuth login for faster onboarding.',
    icon: 'fa-right-to-bracket',
    accent: 'from-sky-500 to-blue-400',
  },
  {
    title: 'Validated CSV/PDF Ingestion',
    description: 'Upload statements in CSV or PDF, validate rows before storage, and review previews and warnings instantly.',
    icon: 'fa-file-circle-check',
    accent: 'from-rose-500 to-pink-400',
  },
  {
    title: 'ML Expense Categorization',
    description: 'Transactions are categorized using lightweight TF-IDF-style scoring with rule-based fallback for stability.',
    icon: 'fa-wand-magic-sparkles',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    title: 'AI Savings Insights',
    description: 'See summary metrics, savings opportunities, category concentration, and trend-based financial recommendations.',
    icon: 'fa-chart-pie',
    accent: 'from-emerald-500 to-green-400',
  },
  {
    title: 'Interactive Dashboards',
    description: 'Track spending, savings, top categories, and recent activity through enhanced dashboard widgets and reports.',
    icon: 'fa-chart-line',
    accent: 'from-amber-500 to-yellow-400',
  },
  {
    title: 'Bank-Grade Security',
    description: 'JWT auth, OAuth guardrails, rate limiting, XSS protection, and request sanitization protect every workflow.',
    icon: 'fa-shield-halved',
    accent: 'from-purple-500 to-violet-400',
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
          From validated statement ingestion to smart categorization and savings analytics, FinTrackAI now covers the full financial workflow end to end.
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
