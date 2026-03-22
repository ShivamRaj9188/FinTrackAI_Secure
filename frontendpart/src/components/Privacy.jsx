import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Privacy = () => {
  return (
    <div className="bg-[#0A0A0A] text-white font-inter min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase">Privacy Policy</h1>
          <p className="text-[#666] font-medium tracking-widest text-[10px] uppercase">Your data. Your control. Transparent by design.</p>
        </div>

        <div className="space-y-12 animate-fade-in">
          {[
            { title: "No Bank Credentials", content: "We never ask for or store login details. Manual upload only. Your secrets remain yours.", icon: "fa-shield-halved" },
            { title: "Secure File Processing", content: "All statements are processed via encrypted sessions using secure neural models. Data is never exposed.", icon: "fa-bolt-lightning" },
            { title: "Temporary Storage", content: "Files are retained only during the session and purged immediately after processing. We don't build databases of your life.", icon: "fa-trash-can" },
            { title: "No Data Sharing", content: "We never share your data with third parties. No tracking. No profiling. No bullshit.", icon: "fa-user-secret" }
          ].map((item, idx) => (
            <div key={idx} className="cashmate-card group hover:border-[var(--accent-primary)] transition-all duration-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#0D0D0D] border border-white/5 flex items-center justify-center group-hover:bg-[var(--accent-primary)] group-hover:text-black transition-all">
                  <i className={`fas ${item.icon} text-lg`}></i>
                </div>
                <div>
                  <h2 className="text-xl font-black mb-3 uppercase tracking-wide">{item.title}</h2>
                  <p className="text-[#666] font-medium leading-relaxed">{item.content}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="cashmate-card border-dashed border-white/10 text-center py-12">
            <h2 className="text-xl font-black mb-4 uppercase tracking-wide">Need Support?</h2>
            <p className="text-[#666] mb-8 font-medium">Our engineers are standing by.</p>
            <a href="mailto:support@fintrackai.in" className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl text-sm font-black hover:scale-105 transition-all">
              CONTACT SUPPORT
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;