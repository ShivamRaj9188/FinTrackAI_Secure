import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Help = () => {
  return (
    <div className="bg-gray-50 text-gray-800 font-inter">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-12 text-center">Help Center</h1>
        <div className="space-y-8 text-gray-700 text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-blue-600">How do I get started?</h2>
            <p>Sign up and upload your bank statement. The app will process and display dashboards.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-600">Do I need to link my bank account?</h2>
            <p>No. FinTrackAI never asks for credentials. Just upload your statements manually.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-600">What file formats are supported?</h2>
            <p>PDF and CSV files from Indian banks or payment apps.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-600">Is my data secure?</h2>
            <p>Yes. Data is encrypted and temporarily stored for processing only during your session.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-600">Can I use it on mobile?</h2>
            <p>Yes. FinTrackAI is fully responsive across devices.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-600">Still need help?</h2>
            <p>
              Email us at{' '}
              <a href="mailto:support@fintrackai.in" className="text-blue-600 underline">
                support@fintrackai.in
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;