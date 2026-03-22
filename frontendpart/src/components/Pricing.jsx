import React from 'react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for getting started with AI-driven finance tracking.',
    features: [
      '5 statement uploads / month',
      'Basic AI categorization',
      'Spending overview dashboard',
      'Email support',
    ],
    cta: 'Get Started Free',
    accent: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/ month',
    description: 'Unlock the full power of AI insights and unlimited tracking.',
    features: [
      'Unlimited statement uploads',
      'Advanced AI insights & tips',
      'Category trend analysis',
      'CSV & PDF report export',
      'Priority support',
      'Custom budget alerts',
    ],
    cta: 'Upgrade to Pro',
    accent: true,
    badge: 'POPULAR',
  },
  {
    name: 'Enterprise',
    price: '₹1,999',
    period: '/ month',
    description: 'For teams and businesses needing financial intelligence at scale.',
    features: [
      'Everything in Pro',
      'Multi-user access',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    accent: false,
  },
];

const Pricing = () => (
  <section id="pricing" className="py-28 bg-[#0A0A0A] relative overflow-hidden">
    {/* Glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--accent-secondary)] opacity-[0.03] blur-[200px] rounded-full"></div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full mb-6">
          <span className="text-[10px] font-semibold tracking-wider text-[#666]">SIMPLE PRICING</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5">
          Choose Your <span className="gradient-text">Plan</span>
        </h2>
        <p className="text-lg text-[#666] max-w-xl mx-auto">
          Start free, upgrade when you're ready. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-5 items-start">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-2xl p-7 transition-all animate-fade-in-up ${
              plan.accent
                ? 'glow-card border-[var(--accent-primary)]/20 ring-1 ring-[var(--accent-primary)]/10 scale-[1.02]'
                : 'cashmate-card'
            }`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black text-[10px] font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[#888] uppercase tracking-wider mb-3">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                {plan.period !== 'forever' && (
                  <span className="text-sm text-[#555] font-medium">{plan.period}</span>
                )}
              </div>
              <p className="text-sm text-[#555] mt-3 leading-relaxed">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feat, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-[#999]">
                  <i className="fas fa-check text-[var(--accent-secondary)] text-[10px]"></i>
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link to={plan.name === 'Enterprise' ? '/contact' : '/signup'}>
              <button className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                plan.accent
                  ? 'bg-white text-black hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10'
                  : 'bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08]'
              }`}>
                {plan.cta}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;