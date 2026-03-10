import React from 'react';
import Header from './Header';
import Footer from './Footer';

const About = () => {
  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              About <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">FinTrackAI</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Empowering individuals to take control of their financial future through AI-powered insights and smart tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At FinTrackAI, we believe that everyone deserves access to intelligent financial management tools. 
                Our mission is to democratize financial literacy and empower individuals to make informed decisions 
                about their money through cutting-edge AI technology.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We're committed to providing transparent, secure, and user-friendly solutions that help you 
                understand your spending patterns, optimize your savings, and achieve your financial goals.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">10K+</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">₹50Cr+</div>
                  <div className="text-gray-600">Money Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">95%</div>
                  <div className="text-gray-600">Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-600">AI Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Founded in 2023 by a team of financial experts and AI engineers, FinTrackAI was born from a simple 
              observation: personal finance management was unnecessarily complex and intimidating for most people.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lightbulb text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">The Idea</h3>
              <p className="text-gray-600">
                We realized that traditional budgeting apps were static and didn't provide actionable insights. 
                What if AI could analyze spending patterns and provide personalized recommendations?
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-code text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Development</h3>
              <p className="text-gray-600">
                Our team spent months developing sophisticated machine learning algorithms that could understand 
                spending behaviors and provide meaningful financial insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-rocket text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Launch</h3>
              <p className="text-gray-600">
                Today, FinTrackAI helps thousands of users make smarter financial decisions with AI-powered 
                insights, automated categorization, and predictive analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Development Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're a passionate team of full-stack developers dedicated to building innovative financial 
              technology solutions that make money management simple and accessible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">KA</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Kamal</h3>
              <p className="text-blue-600 font-medium mb-2">Full Stack Developer</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SH</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Shivam</h3>
              <p className="text-purple-600 font-medium mb-2">Full Stack Developer</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">BH</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Bhoomi</h3>
              <p className="text-green-600 font-medium mb-2">Full Stack Developer</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">HA</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Harshit</h3>
              <p className="text-orange-600 font-medium mb-2">Full Stack Developer</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">VA</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Varun</h3>
              <p className="text-indigo-600 font-medium mb-2">Full Stack Developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we build products for our users.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Security First</h3>
              <p className="text-gray-300">
                Your financial data is encrypted and protected with bank-level security. We never store 
                your banking credentials or sell your data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-eye text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparency</h3>
              <p className="text-gray-300">
                We believe in clear, honest communication about how our AI works, what data we use, 
                and how we generate insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">User-Centric</h3>
              <p className="text-gray-300">
                Every feature we build is designed with our users in mind. We constantly gather feedback 
                and iterate to improve your experience.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-graduation-cap text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Education</h3>
              <p className="text-gray-300">
                We're committed to improving financial literacy through educational content, tips, 
                and personalized guidance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bolt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-300">
                We're always exploring new ways to use AI and technology to solve financial challenges 
                and improve user outcomes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Inclusivity</h3>
              <p className="text-gray-300">
                Financial wellness should be accessible to everyone, regardless of income level, 
                background, or financial knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who are already making smarter financial decisions with FinTrackAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Get Started Free
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
