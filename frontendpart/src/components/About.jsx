import React from 'react';
import Header from './Header';
import Footer from './Footer';

const About = () => {
  return (
    <div className="bg-[#0A0A0A] text-white font-inter min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight uppercase">
              The Evolution of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">FinTrackAI</span>
            </h1>
            <p className="text-xl text-[#666] max-w-3xl mx-auto leading-relaxed font-medium">
              We're building the first neural-native financial platform. For those who demand precision, speed, and absolute control.
            </p>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[var(--accent-primary)]/5 to-transparent pointer-events-none"></div>
      </section>

      {/* Mission Section */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-xs font-black text-[var(--accent-secondary)] tracking-[0.4em] uppercase mb-8">OUR CORE PROTOCOL</h2>
              <p className="text-3xl font-black mb-8 leading-tight uppercase">DEMOCRATIZING INTELLIGENCE.</p>
              <p className="text-[#666] font-medium leading-relaxed mb-6">
                At FinTrackAI, we believe that high-end financial management tools shouldn't be reserved for the elite.
                Our mission is to bake professional-grade intelligence into every user's workflow.
              </p>
              <div className="flex gap-4">
                <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex-1 text-center">
                  <div className="text-2xl font-black text-white">10K+</div>
                  <div className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase mt-1">OPERATORS</div>
                </div>
                <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex-1 text-center">
                  <div className="text-2xl font-black text-white">₹50Cr+</div>
                  <div className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase mt-1">VOLUME</div>
                </div>
              </div>
            </div>
            <div className="cashmate-card relative overflow-hidden p-12 bg-white/5 border-white/10 animate-fade-in-right">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-10 blur-3xl"></div>
              <p className="text-sm font-black text-white leading-loose italic">
                "WE DON'T JUST TRACK SPENDING. WE AUGMENT HUMAN DECISION-MAKING WITH ARTIFICIAL PRECISION."
              </p>
              <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-black">F</div>
                <div>
                  <p className="text-xs font-black uppercase text-white tracking-widest">SYSTEM CORE</p>
                  <p className="text-[10px] font-bold text-[#4D4D4D]">EST. 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-xs font-black text-[var(--accent-primary)] tracking-[0.4em] uppercase mb-8">THE ARCHITECTS</h2>
            <h3 className="text-4xl font-black text-white uppercase tracking-tight">THE DEVELOPMENT TEAM</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { name: "Kamal", init: "KA", color: "[var(--accent-primary)]" },
              { name: "Shivam", init: "SH", color: "[var(--accent-secondary)]" },
              { name: "Bhoomi", init: "BH", color: "green-400" },
              { name: "Harshit", init: "HA", color: "orange-400" },
              { name: "Varun", init: "VA", color: "indigo-400" }
            ].map((user, idx) => (
              <div key={idx} className="text-center group">
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-white/5 group-hover:border-${user.color} transition-all duration-500 scale-100 group-hover:scale-110 bg-[#111]`}>
                  <span className="text-xl font-black text-white opacity-50 group-hover:opacity-100">{user.init}</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">{user.name}</h4>
                <p className="text-[10px] font-bold text-[#4D4D4D] tracking-widest uppercase mt-2">FULL STACK</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Security First", icon: "fa-shield-halved", text: "Encryption at the neural layer. Your data is protected by industry-leading protocols." },
              { title: "Transparency", icon: "fa-eye", text: "Full disclosure on AI logic. We build trust through open execution and clear patterns." },
              { title: "Universal", icon: "fa-users", text: "Built for everyone. From individual freelancers to scaling startups." }
            ].map((value, idx) => (
              <div key={idx} className="cashmate-card hover:bg-white/5 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-8 group-hover:bg-white group-hover:text-black transition-all">
                  <i className={`fas ${value.icon} text-lg`}></i>
                </div>
                <h4 className="text-lg font-black text-white uppercase mb-4 tracking-wide">{value.title}</h4>
                <p className="text-sm text-[#4D4D4D] font-medium leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase tracking-tight">Ready to Evolve?</h2>
          <p className="text-xl text-[#666] mb-12 font-medium">Join the next generation of financial operators.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/signup" className="bg-white text-black px-12 py-5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 uppercase">
              GET STARTED FREE
            </a>
            <a href="/contact" className="bg-[#1A1A1A] text-white border border-white/10 px-12 py-5 rounded-2xl font-black text-sm hover:bg-[#252525] transition-all uppercase">
              CONTACT CORE
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
