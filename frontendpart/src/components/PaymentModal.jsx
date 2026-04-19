import { useState } from 'react';
import { openRazorpayCheckout } from '../api/payment';

// Plan price table (must match backend PLAN_PRICES)
const PRICES = {
  Pro: { monthly: 149, yearly: 1490 },
  Enterprise: { monthly: 999, yearly: 9990 },
};

const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!plan || plan === 'Basic') return null;

  const price = PRICES[plan]?.[billing] ?? 0;

  const handlePay = async () => {
    setLoading(true);
    setError('');

    try {
      const userInfo = (() => {
        try { return JSON.parse(localStorage.getItem('userInfo') || '{}'); } catch { return {}; }
      })();

      const result = await openRazorpayCheckout({ plan, billing, userInfo });

      if (result.success) {
        // Update local userInfo plan so UI reflects change immediately
        try {
          const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
          localStorage.setItem('userInfo', JSON.stringify({ ...info, plan }));
        } catch { /* ignore */ }

        onSuccess?.(result);
        onClose?.();
      } else if (result.message !== 'Payment cancelled') {
        setError(result.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-md bg-[#111] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="relative p-8 pb-6 border-b border-white/[0.06]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-[#555] hover:text-white hover:bg-white/[0.1] transition-all"
            aria-label="Close"
          >
            <i className="fas fa-times text-xs" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm">F</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Upgrade to</p>
              <h2 className="text-lg font-black text-white">{plan} Plan</h2>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
            {['monthly', 'yearly'].map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  billing === b
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#555] hover:text-white'
                }`}
              >
                {b === 'yearly' ? 'Yearly (save 17%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="px-8 py-6">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-5xl font-black text-white">₹{price.toLocaleString('en-IN')}</span>
            <span className="text-sm text-[#555] font-medium">/ {billing === 'yearly' ? 'year' : 'month'}</span>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-6">
            {(plan === 'Pro'
              ? ['Unlimited statement uploads', 'Advanced AI insights', 'Savings summaries', 'PDF/CSV exports', 'Priority support']
              : ['Everything in Pro', 'Multi-user access', 'API access', 'Custom integrations', 'SLA guarantee']
            ).map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-[#888]">
                <i className="fas fa-check text-[var(--accent-secondary)] text-[10px]" />
                {feat}
              </li>
            ))}
          </ul>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4 animate-fade-in">
              <i className="fas fa-exclamation-circle text-red-400 text-sm" />
              <span className="text-red-400 text-xs font-medium">{error}</span>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full btn-primary justify-center py-4 rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-spinner fa-spin text-xs" />
                OPENING CHECKOUT...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="fas fa-lock text-xs" />
                PAY ₹{price.toLocaleString('en-IN')} SECURELY
              </span>
            )}
          </button>

          <p className="text-center text-[10px] text-[#333] mt-4 font-medium">
            Powered by Razorpay · UPI · Cards · Net Banking · Wallets
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
