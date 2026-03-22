import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Terms = () => {
  return (
    <div className="bg-[#0A0A0A] text-white font-inter min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase">Terms of Service</h1>
          <p className="text-[#666] font-medium tracking-widest text-[10px] uppercase">The legal details. Handled with professional precision.</p>
        </div>

        <div className="space-y-8 animate-fade-in">
          <div className="cashmate-card bg-white/5 border-white/10">
            <p className="text-[#888] font-medium leading-relaxed italic">
              "Welcome to FinTrackAI. By accessing our neural financial engine, you agree to these professional standards. We keep it simple, secure, and smart."
            </p>
          </div>

          {[
            { title: "Acceptance", content: "By accessing this website, you accept and agree to be bound by the terms and provision of this agreement." },
            { title: "Use License", content: "Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only." },
            { title: "Disclaimer", content: "The materials are provided on an 'as is' basis. FinTrackAI makes no warranties, expressed or implied." },
            { title: "Limitations", content: "In no event shall FinTrackAI be liable for any damages arising out of the use or inability to use the materials." },
            { title: "Modifications", content: "FinTrackAI may revise these terms at any time without notice. Continued use equals acceptance." }
          ].map((item, idx) => (
            <div key={idx} className="border-b border-white/5 pb-8 last:border-0">
              <h2 className="text-xs font-black text-[var(--accent-secondary)] tracking-[0.2em] uppercase mb-4">{item.title}</h2>
              <p className="text-[#666] font-medium leading-relaxed">{item.content}</p>
            </div>
          ))}

          <div className="cashmate-card bg-[#0D0D0D] border-white/5 border-dashed text-center py-10 mt-12">
            <p className="text-xs font-bold text-[#4D4D4D] tracking-widest uppercase mb-6">QUESTIONS ABOUT LEGAL?</p>
            <a href="mailto:support@fintrackai.in" className="text-white hover:text-[var(--accent-secondary)] transition-colors font-black text-sm uppercase tracking-tight">
              support@fintrackai.in
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;