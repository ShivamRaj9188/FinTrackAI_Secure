import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const MainPricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);

  const pricingData = {
    monthly: {
      basic: '₹0',
      pro: '₹149',
      enterprise: '₹999',
    },
    yearly: {
      basic: '₹0',
      pro: '₹1490',
      enterprise: '₹9990',
    },
  };

  return (
    <div className="bg-[#050505] text-white font-sans min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-24 text-center relative z-10">
        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">Choice of Power</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
          Transparent pricing for professional financial management. Expand your neural engine as you grow.
        </p>

        <div className="inline-flex bg-[#0A0A0A] rounded-2xl p-1.5 mb-20 border border-white/5 shadow-2xl">
          <button
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${isMonthly ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-gray-500 hover:text-white'
              }`}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button
            className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${!isMonthly ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-gray-500 hover:text-white'
              }`}
            onClick={() => setIsMonthly(false)}
          >
            Yearly
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-stretch">
          {/* Basic Plan */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 tracking-[0.3em] uppercase mb-8">BASIC ENGINE</h3>
            <div className="mb-10">
              <span className="text-5xl font-black text-white">{pricingData[isMonthly ? 'monthly' : 'yearly'].basic}</span>
              <span className="text-xs font-bold text-gray-500 ml-2 tracking-widest uppercase">{isMonthly ? '/ MONTH' : '/ YEAR'}</span>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              {[
                "5 statements / month",
                "Basic AI categorization",
                "Standard Dashboard",
                "7-day data retention"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-black text-gray-400 tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#1A1A1A] text-white border border-white/10 py-5 rounded-2xl text-xs font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest">
              START SPRINT
            </button>
          </div>

          {/* Pro Plan */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#0D0D0D] border-2 border-[#00F2FF] relative scale-105 z-20 shadow-[0_0_50px_rgba(0,242,255,0.1)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00F2FF] text-black px-6 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-[#00F2FF]/20">
              MOST ELITE
            </div>
            <h3 className="text-xs font-black text-[#00F2FF] tracking-[0.3em] uppercase mb-8">PRO NEURAL</h3>
            <div className="mb-10">
              <span className="text-5xl font-black text-white">{pricingData[isMonthly ? 'monthly' : 'yearly'].pro}</span>
              <span className="text-xs font-bold text-gray-500 ml-2 tracking-widest uppercase">{isMonthly ? '/ MONTH' : '/ YEAR'}</span>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              {[
                "Unlimited statement uploads",
                "Advanced AI insights",
                "Budget planning & alerts",
                "PDF/Excel exports",
                "Priority support"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-black text-white tracking-widest uppercase">
                  <span className="w-2 h-2 bg-[#00F2FF] rounded-full shadow-[0_0_10px_#00F2FF]"></span>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full bg-white text-black py-6 rounded-2xl text-xs font-black hover:scale-[1.02] transition-all shadow-2xl shadow-white/10 uppercase tracking-widest">
              UPGRADE NOW
            </button>
          </div>

          {/* Business Plan */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 tracking-[0.3em] uppercase mb-8">ENTERPRISE</h3>
            <div className="mb-10">
              <span className="text-5xl font-black text-white">{pricingData[isMonthly ? 'monthly' : 'yearly'].enterprise}</span>
              <span className="text-xs font-bold text-gray-500 ml-2 tracking-widest uppercase">{isMonthly ? '/ MONTH' : '/ YEAR'}</span>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              {[
                "Everything in Premium",
                "GST expense tracking",
                "Full P&L statements",
                "Invoice management",
                "Team collaboration"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs font-black text-gray-400 tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#1A1A1A] text-white border border-white/10 py-5 rounded-2xl text-xs font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest">
              CONTACT SALES
            </button>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#00F2FF] opacity-[0.05] blur-[150px] pointer-events-none"></div>

      <Footer />
    </div>
  );
};

export default MainPricing;