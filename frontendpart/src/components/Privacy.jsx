import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Privacy = () => {
  return (
    <div className="bg-gray-50 text-gray-800 font-inter">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-12 text-center">Privacy Policy</h1>
        <div className="space-y-6 text-gray-700 text-base leading-relaxed">
          <p>We are committed to protecting your privacy. Here's how FinTrackAI handles your data:</p>
          <h2 className="text-xl font-semibold text-blue-600">No Bank Credentials</h2>
          <p>We never ask for or store login details. Manual upload only.</p>
          <h2 className="text-xl font-semibold text-blue-600">Secure File Processing</h2>
          <p>All statements are processed via encrypted sessions using secure AI models.</p>
          <h2 className="text-xl font-semibold text-blue-600">Temporary Storage</h2>
          <p>Files are retained only during the session and deleted after processing.</p>
          <h2 className="text-xl font-semibold text-blue-600">No Data Sharing</h2>
          <p>We never share your data with third parties. No tracking or profiling.</p>
          <h2 className="text-xl font-semibold text-blue-600">Need Support?</h2>
          <p>
            Reach us anytime at{' '}
            <a href="mailto:support@fintrackai.in" className="text-blue-600 underline">
              support@fintrackai.in
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;