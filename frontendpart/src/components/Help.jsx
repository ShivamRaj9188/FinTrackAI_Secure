import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const faqs = [
  {
    question: 'How do I get started?',
    answer: 'Sign up for a free account, then upload your bank statement (PDF or CSV). The AI will automatically process it and display your financial dashboard with insights.',
  },
  {
    question: 'Do I need to link my bank account?',
    answer: 'No. FinTrackAI never asks for your banking credentials. Just upload your statements manually — your data stays completely under your control.',
  },
  {
    question: 'What file formats are supported?',
    answer: 'We support PDF and CSV files from major Indian banks and payment apps including SBI, HDFC, ICICI, Axis, Kotak, PhonePe, and Google Pay.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-grade encryption (AES-256), JWT authentication, rate limiting, XSS protection, and NoSQL injection prevention. Your data is temporarily stored only during processing.',
  },
  {
    question: 'How does AI categorization work?',
    answer: 'Our AI analyzes transaction descriptions and amounts to automatically classify them into categories like Food, Transport, Shopping, Utilities, and more — with 99% accuracy.',
  },
  {
    question: 'Can I use it on mobile?',
    answer: 'Yes. FinTrackAI is fully responsive and works perfectly on mobile, tablet, and desktop browsers.',
  },
  {
    question: 'What does the Pro plan include?',
    answer: 'Pro gives you unlimited statement uploads, advanced AI insights with savings tips, category trend analysis, CSV/PDF report export, custom budget alerts, and priority support — all for ₹499/month.',
  },
  {
    question: 'Can I export my reports?',
    answer: 'Yes. You can export your financial reports as CSV files for spreadsheet analysis, or use the Print to PDF feature for tax filing and audit purposes.',
  },
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="font-sans bg-[#0A0A0A] text-white min-h-screen">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500 opacity-[0.03] blur-[200px] rounded-full"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-circle-question text-xl text-[var(--accent-primary)]"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Help <span className="gradient-text">Center</span>
          </h1>
          <p className="text-lg text-[#666] max-w-lg mx-auto">
            Find answers to common questions about FinTrackAI.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="cashmate-card overflow-hidden animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-white">{faq.question}</h3>
                  <i className={`fas fa-chevron-down text-[10px] text-[#555] transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}></i>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-40 mt-4 pt-4 border-t border-white/[0.04]' : 'max-h-0'}`}>
                  <p className="text-sm text-[#888] leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glow-card p-8 text-center">
            <i className="fas fa-envelope text-xl text-[var(--accent-primary)] mb-4 block"></i>
            <h3 className="text-lg font-bold text-white mb-2">Still need help?</h3>
            <p className="text-sm text-[#555] mb-5">Our support team typically responds within 24 hours.</p>
            <a
              href="mailto:support@fintrackai.in"
              className="btn-primary px-6 py-3 rounded-xl text-sm inline-flex"
            >
              <i className="fas fa-paper-plane text-xs"></i>
              CONTACT SUPPORT
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;