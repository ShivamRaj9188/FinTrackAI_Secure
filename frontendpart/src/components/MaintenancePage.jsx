import React from 'react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-tools text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Under Maintenance</h1>
          <p className="text-gray-600">
            We're currently performing scheduled maintenance to improve your experience.
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <i className="fas fa-clock mr-2"></i>
            We'll be back online shortly. Thank you for your patience!
          </p>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>For urgent matters, please contact:</p>
          <p className="font-medium text-blue-600 mt-1">support@fintrackai.com</p>
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-refresh mr-2"></i>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default MaintenancePage;