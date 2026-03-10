import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Master Your Finances with <span className="text-yellow-300">AI Intelligence</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Upload your bank statements and let our AI categorize expenses, analyze spending patterns, and provide personalized savings recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login">
              <button className="bg-white text-blue-700 hover:bg-slate-100 text-lg font-medium px-6 py-3 rounded-lg">
                Get Started Free
              </button>
            </Link>
            <button className="border border-white text-white hover:bg-white hover:text-blue-700 text-lg font-medium px-6 py-3 rounded-lg flex items-center justify-center">
              <i className="fas fa-play mr-2 text-sm"></i>
              Watch Demo
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="bg-white text-slate-900 rounded-lg shadow-lg rotate-3 hover:rotate-0 transition-transform p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Monthly Overview</h3>
              <span className="text-green-600 text-sm font-medium">+12.5%</span>
            </div>
            <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex justify-center items-end p-4 space-x-2">
              <div className="w-4 h-16 bg-blue-600 rounded-t"></div>
              <div className="w-4 h-20 bg-green-500 rounded-t"></div>
              <div className="w-4 h-12 bg-purple-500 rounded-t"></div>
              <div className="w-4 h-24 bg-yellow-400 rounded-t"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;