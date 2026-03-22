import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'AI Categorization',
    description: 'Neural AI auto-classifies every transaction into meaningful spending categories with 99% accuracy.',
    icon: 'fa-wand-magic-sparkles',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    title: 'Spending Insights',
    description: 'Get monthly patterns, anomaly detection, and personalized budget recommendations powered by Gemini.',
    icon: 'fa-chart-pie',
    accent: 'from-emerald-500 to-green-400',
  },
  {
    title: 'Bank-Grade Security',
    description: 'End-to-end encryption, JWT auth, rate limiting, XSS protection, and input sanitization on every request.',
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
    description: 'Upload bank statements in PDF or CSV. Our parser handles major Indian bank formats automatically.',
    icon: 'fa-cloud-arrow-up',
    accent: 'from-rose-500 to-pink-400',
  },
  {
    title: 'Exportable Reports',
    description: 'Download your financial analysis as CSV or print-ready PDF for tax filing and audit purposes.',
    icon: 'fa-file-export',
    accent: 'from-indigo-500 to-blue-400',
  },
];

const howItWorks = [
  { step: '01', title: 'Sign Up', desc: 'Create your free account in under 30 seconds.' },
  { step: '02', title: 'Upload Statement', desc: 'Drop a PDF or CSV from any Indian bank.' },
  { step: '03', title: 'Get AI Insights', desc: 'Receive personalized spending analysis and savings tips.' },
];

const FeaturesPage = () => (
  <div className="font-sans bg-[#0A0A0A] text-white min-h-screen">
    <Header />

    {/* Hero Block */}
    <section className="pt-24 pb-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)] opacity-[0.04] blur-[200px] rounded-full"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full mb-6">
          <span className="text-[10px] font-semibold tracking-wider text-[#666]">PLATFORM CAPABILITIES</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
          Powerful Features for <span className="gradient-text">Complete Control</span>
        </h1>
        <p className="text-lg text-[#666] max-w-2xl mx-auto leading-relaxed">
          From automatic AI categorization to real-time spending alerts — everything you need to master your finances.
        </p>
      </div>
    </section>

    {/* Feature Grid */}
    <section className="pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="group cashmate-card hover:border-white/10 relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 bg-white/[0.04] border border-white/[0.06] group-hover:border-white/10 transition-all">
                  <i className={`fas ${f.icon} text-base text-[var(--accent-primary)] group-hover:text-white transition-colors`}></i>
                </div>
                <h3 className="text-base font-bold text-white mb-3 tracking-wide">{f.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-24 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-[#666] max-w-lg mx-auto">Three simple steps to take control of your finances.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map((item, i) => (
            <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-lg font-black gradient-text">{item.step}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#555] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to Master Your Money?</h2>
        <p className="text-[#555] mb-8">Start free — no credit card required.</p>
        <Link to="/signup">
          <button className="btn-primary px-8 py-4 rounded-2xl text-sm">
            <i className="fas fa-bolt text-xs"></i>
            GET STARTED FREE
          </button>
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default FeaturesPage;