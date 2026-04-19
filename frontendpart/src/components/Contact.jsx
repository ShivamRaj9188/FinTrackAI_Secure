import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import peopleChatImage from '../assets/images/people chat.png';
import { sendContactMessage } from '../api';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    message: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.agreeTerms) {
      setError('Please agree to total protocol standards.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendContactMessage(formData);
      if (result.success) {
        setSuccess('SIGNAL RECEIVED. WE WILL RESPOND SHORTLY.');
        setFormData({ firstName: '', lastName: '', email: '', department: '', message: '', agreeTerms: false });
      } else {
        setError(result.message || 'TRANSMISSION FAILED.');
      }
    } catch (err) { setError('UPLINK ERROR.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-[#0A0A0A] text-white font-inter min-h-screen">
      <Header />

      <section className="py-24 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 animate-fade-in-up">
          <h2 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] uppercase tracking-tight">Signal Us.</h2>
          <p className="text-xl text-[#666] font-medium leading-relaxed">
            Direct uplink to our engineering team. We're here to solve.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </section>

      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
          <div className="animate-fade-in-left">
            <div className="cashmate-card bg-white/5 border-white/10 p-12">
              <h3 className="text-xs font-black text-[var(--accent-primary)] tracking-[0.4em] uppercase mb-10">THE PROTOCOL</h3>
              <p className="text-2xl font-black text-white uppercase leading-tight mb-8">ENGINEERED FOR DIALOGUE.</p>
              <div className="space-y-8">
                {[
                  { icon: "fa-location-dot", label: "HQ", text: "Uttarakhand, India" },
                  { icon: "fa-phone", label: "SIGNAL", text: "+91 63996 66608" },
                  { icon: "fa-terminal", label: "LINK", text: "ashish.raj.00099@gmail.com" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                      <i className={`fas ${item.icon} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase">{item.label}</p>
                      <p className="text-sm font-bold text-white uppercase">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="animate-fade-in-right">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</div>}
              {success && <div className="bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 p-5 rounded-2xl text-[var(--accent-secondary)] text-[10px] font-black uppercase tracking-widest">{success}</div>}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase ml-2">FIRST NAME</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 text-sm font-black uppercase text-white outline-none focus:border-white/20 transition-all" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase ml-2">LAST NAME</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 text-sm font-black uppercase text-white outline-none focus:border-white/20 transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase ml-2">EMAIL ADDRESS</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 text-sm font-black uppercase text-white outline-none focus:border-white/20 transition-all" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase ml-2">DEPT</label>
                <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 text-sm font-black uppercase text-white outline-none hover:border-white/20 transition-all appearance-none">
                  <option value="">SELECT CORE DEPT</option>
                  <option value="Support">ENGINEERING SUPPORT</option>
                  <option value="Feedback">SYSTEM FEEDBACK</option>
                  <option value="Sales">GROWTH / SALES</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase ml-2">TRANSMISSION CONTENT</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows="6" className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 text-sm font-black uppercase text-white outline-none focus:border-white/20 transition-all resize-none"></textarea>
              </div>

              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="peer hidden" />
                  <div className="w-6 h-6 rounded-lg bg-[#1A1A1A] border border-white/5 peer-checked:bg-white peer-checked:border-white transition-all"></div>
                  <i className="fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black text-[10px] opacity-0 peer-checked:opacity-100"></i>
                </div>
                <span className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase group-hover:text-white transition-colors">I AGREE TO TOTAL SYSTEM STANDARDS.</span>
              </label>

              <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/10 disabled:opacity-50 mt-8">
                {loading ? 'UPLINKING...' : 'INITIATE SIGNAL'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 px-6 bg-[#080808] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xs font-black text-[var(--accent-primary)] tracking-[0.4em] uppercase mb-12 text-center">CORE LOCATION</h3>
          <div className="rounded-3xl overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14424.998842483148!2d74.6061824!3d25.3294004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1751818273373!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
