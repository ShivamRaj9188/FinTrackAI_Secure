import React from 'react';

const features = [
  { title: 'Smart Categorization', description: 'Automatically classify your spending using AI for better budgeting.', icon: 'fas fa-tags', color: 'bg-blue-100 text-blue-600' },
  { title: 'Expense Insights', description: 'Get monthly insights and patterns on where your money goes.', icon: 'fas fa-chart-pie', color: 'bg-green-100 text-green-600' },
  { title: 'Secure Syncing', description: 'Sync your bank accounts securely with end-to-end encryption.', icon: 'fas fa-shield-alt', color: 'bg-purple-100 text-purple-600' },
  { title: 'Custom Alerts', description: 'Set limits and receive alerts for overspending.', icon: 'fas fa-bell', color: 'bg-yellow-100 text-yellow-600' },
  { title: 'Multi-account Support', description: 'Track all your accounts in one place with real-time updates.', icon: 'fas fa-university', color: 'bg-indigo-100 text-indigo-600' },
  { title: 'Downloadable Reports', description: 'Export insights and summaries to Excel or PDF format.', icon: 'fas fa-file-download', color: 'bg-red-100 text-red-600' },
];

const Features = () => (
  <section id="features" className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features for Complete Financial Control</h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          From AI-powered categorization to detailed insights, everything you need to take control of your finances.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-lg p-8 hover:shadow-xl transition-shadow">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${f.color}`}>
              <i className={`${f.icon} text-lg`}></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">{f.title}</h3>
            <p className="text-slate-600">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;