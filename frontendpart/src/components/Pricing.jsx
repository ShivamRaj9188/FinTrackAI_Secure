import React from 'react';

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Start free and upgrade as your financial needs grow</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="border border-slate-200 rounded-lg p-8 text-center shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Free</h3>
            <p className="text-3xl font-bold text-blue-600 mb-1">₹0</p>
            <p className="text-sm text-slate-500 mb-6">Forever free</p>
            <ul className="text-slate-600 text-left mb-6 space-y-2">
              <li>• Upload up to 5 statements/month</li>
              <li>• Basic AI categorization</li>
              <li>• Simple dashboard</li>
              <li>• 7-day data retention</li>
            </ul>
            {/* <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
              Get Started
            </button> */}
          </div>

          {/* Premium Plan */}
          <div className="border border-blue-600 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg p-8 text-center shadow-xl transform scale-105">
            <h3 className="text-xl font-semibold text-white mb-2">Premium</h3>
            <p className="text-3xl font-bold text-white mb-1">₹149</p>
            <p className="text-sm text-white mb-6">per month</p>
            <ul className="text-white text-left mb-6 space-y-2">
              <li>• Unlimited statement uploads</li>
              <li>• Advanced AI insights</li>
              <li>• Budget planning & alerts</li>
              <li>• PDF/Excel exports</li>
              <li>• Priority support</li>
            </ul>
            {/* <button className="w-full bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm font-medium">
              Start Premium
            </button> */}
          </div>

          {/* Business Plan */}
          <div className="bg-slate-900 text-white rounded-lg p-8 text-center shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Business</h3>
            <p className="text-3xl font-bold mb-1">₹999</p>
            <p className="text-sm text-slate-300 mb-6">per month</p>
            <ul className="text-slate-300 text-left mb-6 space-y-2">
              <li>• Everything in Premium</li>
              <li>• GST expense tracking</li>
              <li>• P&L statements</li>
              <li>• Invoice management</li>
              <li>• Team collaboration</li>
            </ul>
            {/* <button className="w-full bg-white text-slate-900 px-4 py-2 rounded hover:bg-slate-200 text-sm font-medium">
              Contact Sales
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;