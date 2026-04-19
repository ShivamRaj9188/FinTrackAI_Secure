import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PaymentModal from './PaymentModal';

const MainPricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null); // opens PaymentModal
  const [upgradeSuccess, setUpgradeSuccess] = useState('');
  const navigate = useNavigate();

  const pricingData = {
    monthly:  { basic: '₹0',     pro: '₹149',   enterprise: '₹999'  },
    yearly:   { basic: '₹0',     pro: '₹1,490', enterprise: '₹9,990' },
  };

  const billing = isMonthly ? 'monthly' : 'yearly';

  const handleCTA = (planName) => {
    if (planName === 'Basic') {
      navigate('/signup');
      return;
    }
    if (planName === 'Enterprise') {
      navigate('/contact');
      return;
    }
    // Check if logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setSelectedPlan(planName);
  };

  return (
    <div className="bg-[#050505] text-white font-sans min-h-screen relative">
      <Header />

      {/* PaymentModal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={(result) => {
            setUpgradeSuccess(`🎉 Successfully upgraded to ${selectedPlan} Plan!`);
            setTimeout(() => setUpgradeSuccess(''), 6000);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-24 text-center relative z-10">
        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">Choice of Power</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
          Transparent pricing for secure ingestion, smarter categorization, and richer financial analytics as you grow.
        </p>

        {upgradeSuccess && (
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl mb-10 text-emerald-400 text-sm font-semibold animate-fade-in">
            <i className="fas fa-check-circle" />
            {upgradeSuccess}
          </div>
        )}

        <div className="inline-flex bg-[#0A0A0A] rounded-2xl p-1.5 mb-20 border border-white/5 shadow-2xl">
          <button
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${isMonthly ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-gray-500 hover:text-white'}`}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${!isMonthly ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-gray-500 hover:text-white'}`}
            onClick={() => setIsMonthly(false)}
          >
            Yearly <span className="ml-1 text-emerald-400">Save 17%</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-stretch">
          {/* Basic */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 tracking-[0.3em] uppercase mb-8">BASIC ENGINE</h3>
            <div className="mb-10">
              <span className="text-5xl font-black text-white">{pricingData[billing].basic}</span>
              <span className="text-xs font-bold text-gray-500 ml-2 tracking-widest uppercase">/ {isMonthly ? 'MONTH' : 'YEAR'}</span>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              {['5 statements / month', 'JWT + Google sign-in', 'Validated CSV/PDF ingestion', 'Basic AI categorization', 'Standard dashboard', '7-day data retention'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-black text-gray-400 tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />{item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCTA('Basic')}
              className="w-full bg-[#1A1A1A] text-white border border-white/10 py-5 rounded-2xl text-xs font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest"
            >
              START FREE
            </button>
          </div>

          {/* Pro */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#0D0D0D] border-2 border-[#00F2FF] relative scale-105 z-20 shadow-[0_0_50px_rgba(0,242,255,0.1)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00F2FF] text-black px-6 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-[#00F2FF]/20">
              MOST POPULAR
            </div>
            <h3 className="text-xs font-black text-[#00F2FF] tracking-[0.3em] uppercase mb-8">PRO NEURAL</h3>
            <div className="mb-10">
              <span className="text-5xl font-black text-white">{pricingData[billing].pro}</span>
              <span className="text-xs font-bold text-gray-500 ml-2 tracking-widest uppercase">/ {isMonthly ? 'MONTH' : 'YEAR'}</span>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              {['Unlimited statement uploads', 'Advanced AI insights', 'Savings opportunity summaries', 'Category trend analysis', 'PDF/Excel exports', 'Priority support'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-black text-white tracking-widest uppercase">
                  <span className="w-2 h-2 bg-[#00F2FF] rounded-full shadow-[0_0_10px_#00F2FF]" />{item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCTA('Pro')}
              className="w-full bg-white text-black py-6 rounded-2xl text-xs font-black hover:scale-[1.02] transition-all shadow-2xl shadow-white/10 uppercase tracking-widest"
            >
              UPGRADE TO PRO
            </button>
          </div>

          {/* Enterprise */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 tracking-[0.3em] uppercase mb-8">ENTERPRISE</h3>
            <div className="mb-10">
              <span className="text-5xl font-black text-white">{pricingData[billing].enterprise}</span>
              <span className="text-xs font-bold text-gray-500 ml-2 tracking-widest uppercase">/ {isMonthly ? 'MONTH' : 'YEAR'}</span>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              {['Everything in Pro', 'Multi-user financial access', 'Custom integrations', 'Dedicated onboarding', 'Team collaboration', 'SLA guarantee'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-black text-gray-400 tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />{item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCTA('Enterprise')}
              className="w-full bg-[#1A1A1A] text-white border border-white/10 py-5 rounded-2xl text-xs font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest"
            >
              CONTACT SALES
            </button>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#00F2FF] opacity-[0.03] blur-[150px] pointer-events-none rounded-full" />

      <Footer />
    </div>
  );
};

export default MainPricing;
