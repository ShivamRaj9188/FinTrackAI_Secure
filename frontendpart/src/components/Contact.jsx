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

  // Refs for animations
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroParaRef = useRef(null);
  const introImageRef = useRef(null);
  const introTextRef = useRef(null);
  const formRowsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    requestAnimationFrame(() => {
      gsap.fromTo(heroTitleRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1 });
      gsap.fromTo(heroParaRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.3 });

      gsap.fromTo(introImageRef.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 1, delay: 0.5 });
      gsap.fromTo(introTextRef.current, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1, delay: 0.6 });

      gsap.fromTo(
        formRowsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.9,
          stagger: 0.2,
          ease: 'power2.out',
        }
      );
    });
  }, []);

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
      setError('Please agree to the terms and policy.');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await sendContactMessage(formData);
      
      if (result.success) {
        setSuccess('Message sent successfully! We will get back to you shortly.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          department: '',
          message: '',
          agreeTerms: false,
        });
      } else {
        setError(result.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-inter bg-gray-50 text-gray-800 min-h-screen">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="hero bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-center py-20 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <h2 ref={heroTitleRef} className="text-5xl font-bold mb-6 text-gray-800 leading-tight">Get in Touch</h2>
          <p ref={heroParaRef} className="text-xl text-gray-600 leading-relaxed">
            Have any questions? Reach out to us from our contact form and we'll get back to you shortly.
          </p>
        </div>
      </section>

      {/* Contact Intro */}
      <section className="contact-intro flex flex-wrap justify-center items-center py-16 px-6 bg-white gap-12">
        <div className="intro-image" ref={introImageRef}>
          <img
            src={peopleChatImage}
            alt="People holding speech bubbles"
            className="max-w-full rounded-xl shadow-lg w-[450px] hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="intro-text max-w-md" ref={introTextRef}>
          <h3 className="text-3xl font-semibold mb-6 text-gray-800">Let's Talk</h3>
          <p className="mb-4 text-gray-600 leading-relaxed">
            Let's make something great together. We're trusted by 5000+ users. Join them by using FinTrackAI.
          </p>
          <p className="mb-6 text-gray-600 leading-relaxed">
            Reach out for queries, partnership, or feedback—we'd love to hear from you.
          </p>
          <button className="join-btn inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:transform hover:-translate-y-1 hover:shadow-lg">
            Join Us
          </button>
        </div>
      </section>

      {/* Form and Contact Info */}
      <section className="contact-main py-16 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <form
            className="contact-form bg-white p-8 rounded-xl shadow-lg mb-12 border border-gray-100"
            onSubmit={handleSubmit}
          >
            <h3 className="text-2xl font-semibold mb-8 text-gray-800 text-center">Send us a Message</h3>

            {error && (
              <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <div className="success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                <strong>Success:</strong> {success}
              </div>
            )}

            <div
              className="form-row flex flex-col md:flex-row gap-6 mb-6"
              ref={(el) => (formRowsRef.current[0] = el)}
            >
              <input
                type="text"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div
              className="form-row flex flex-col md:flex-row gap-6 mb-6"
              ref={(el) => (formRowsRef.current[1] = el)}
            >
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select a department</option>
                <option value="Support">Support</option>
                <option value="Feedback">Feedback</option>
                <option value="Careers">Careers</option>
                <option value="Sales">Sales</option>
                <option value="Partnership">Partnership</option>
              </select>
            </div>

            <div
              className="form-row mb-6"
              ref={(el) => (formRowsRef.current[2] = el)}
            >
              <textarea
                placeholder="Your Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-all duration-200"
              ></textarea>
            </div>

            <div
              className="form-row checkbox-row flex items-center mb-8"
              ref={(el) => (formRowsRef.current[3] = el)}
            >
              <label className="checkbox-label flex items-center gap-3 text-gray-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
                I agree to the terms and policy.
              </label>
            </div>

            <div
              className="form-row button-row text-center"
              ref={(el) => (formRowsRef.current[4] = el)}
            >
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:from-green-700 hover:to-green-800 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>

          <div className="contact-info bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Contact Information</h3>
            <div className="space-y-4">
              <p className="flex items-center justify-center md:justify-start text-gray-700">
                <i className="fas fa-map-marker-alt text-blue-600 mr-3 w-5"></i>
                Moonshine St. 14/05, Light City, London
              </p>
              <p className="flex items-center justify-center md:justify-start text-gray-700">
                <i className="fas fa-phone text-blue-600 mr-3 w-5"></i>
                00 (123) 456 78 90
              </p>
              <p className="flex items-center justify-center md:justify-start text-gray-700">
                <i className="fas fa-envelope text-blue-600 mr-3 w-5"></i>
                contact@fintrackai.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="map py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold mb-8 text-gray-800 text-center">Find Us</h3>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14424.998842483148!2d74.6061824!3d25.3294004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1751818273373!5m2!1sen!2sin"
              width="100%"
              height="400"
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
