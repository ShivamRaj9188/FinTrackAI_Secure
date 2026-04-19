import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for getting started with secure uploads, smart categorization, and dashboard tracking.',
    features: [
      '5 statement uploads / month',
      'JWT + Google sign-in access',
      'Validated CSV/PDF ingestion',
      'Basic smart categorization',
      'Spending overview dashboard',
      'Email support',
    ],
    cta: 'Get Started Free',
    accent: false,
    action: 'signup',
  },
  {
    name: 'Pro',
    price: '₹149',
    period: '/ month',
    description: 'Unlock richer analytics, unlimited uploads, and deeper financial visibility.',
    features: [
      'Unlimited statement uploads',
      'Advanced AI insights & tips',
      'Category trend analysis',
      'Savings opportunity summaries',
      'CSV & PDF report export',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    accent: true,
    badge: 'POPULAR',
    action: 'pay',
  },
  {
    name: 'Enterprise',
    price: '₹999',
    period: '/ month',
    description: 'For teams and businesses needing multi-user financial intelligence at scale.',
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
    action: 'contact',
  },
];

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState('');
  const navigate = useNavigate();

  const handleCTA = (plan) => {
    if (plan.action === 'signup') {
      navigate('/signup');
    } else if (plan.action === 'contact') {
      navigate('/contact');
    } else if (plan.action === 'pay') {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      setSelectedPlan(plan.name);
    }
  };

  return (
    <section id="pricing" className="py-28 bg-[#0A0A0A] relative overflow-hidden">
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null);
            setUpgradeSuccess(`🎉 Successfully upgraded to ${selectedPlan} Plan!`);
            setTimeout(() => setUpgradeSuccess(''), 6000);
          }}
        />
      )}

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--accent-secondary)] opacity-[0.03] blur-[200px] rounded-full" />

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

          {upgradeSuccess && (
            <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl mt-6 text-emerald-400 text-sm font-semibold animate-fade-in">
              <i className="fas fa-check-circle" />{upgradeSuccess}
            </div>
          )}
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
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black text-[10px] font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

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

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-[#999]">
                    <i className="fas fa-check text-[var(--accent-secondary)] text-[10px]" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTA(plan)}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                  plan.accent
                    ? 'bg-white text-black hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10'
                    : 'bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
