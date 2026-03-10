import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Terms = () => {
  return (
    <div className="bg-gray-50 text-gray-800 font-inter">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-12 text-center">Terms of Service</h1>
        <div className="space-y-6 text-gray-700 text-base leading-relaxed">
          <p>
            Welcome to FinTrackAI! By using our platform, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern FinTrackAI's relationship with you in relation to this website.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-600">Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-600">Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on FinTrackAI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-600">Disclaimer</h2>
          <p>
            The materials on FinTrackAI's website are provided on an 'as is' basis. FinTrackAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-600">Limitations</h2>
          <p>
            In no event shall FinTrackAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FinTrackAI's website.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-600">Privacy Policy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-600">Modifications</h2>
          <p>
            FinTrackAI may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
          </p>
          
          <h2 className="text-xl font-semibold text-blue-600">Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{' '}
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

export default Terms;