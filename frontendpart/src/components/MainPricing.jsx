import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainPricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const navigate = useNavigate();

  const pricingData = {
    monthly: {
      basic: '₹0 per month',
      pro: '₹199 per month',
      enterprise: 'Custom (Billed monthly)',
    },
    yearly: {
      basic: '₹0 per year',
      pro: '₹2,148 per year',
      enterprise: 'Custom (Billed annually)',
    },
  };

  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pricing</h1>
        <p className="text-gray-500 text-lg mb-8">
          Do more impactful work with a privacy first calendar that plugs<br />into all your apps at work.
        </p>

        <div className="inline-flex bg-gray-200 rounded-full p-1 mb-12">
          <button
            className={`px-6 py-2 text-sm font-medium focus:outline-none transition-all duration-200 rounded-full ${
              isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 text-sm font-medium focus:outline-none transition-all duration-200 rounded-full ${
              !isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setIsMonthly(false)}
          >
            Yearly
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Basic Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-green-500 to-blue-400 p-2 rounded-full">
                  <i className="fas fa-tasks text-white"></i>
                </div>
                <h3 className="text-lg font-semibold">Basic Plan</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Perfect for individuals or small teams looking to stay organized with basic features.</p>
              <p className="text-3xl font-bold mb-1">
                {pricingData[isMonthly ? 'monthly' : 'yearly'].basic}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-upload"></i></span> Upload up to 5 statements/month</li>
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-robot"></i></span> Basic AI categorization</li>
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-tachometer-alt"></i></span> Simple dashboard</li>
                <li className="flex items-center gap-2"><span className="text-green-500"><i className="fas fa-clock"></i></span> 7-day data retention</li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-gradient-to-r from-green-500 to-blue-400 text-white font-medium py-2 rounded-md hover:opacity-90 transition"
            >
              Start for free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-500 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
              Most Popular
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-purple-500 to-blue-400 p-2 rounded-full">
                  <i className="fas fa-rocket text-white"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Ideal for growing teams needing more robust tools and integrations.</p>
              <p className="text-3xl font-bold mb-1">
                {pricingData[isMonthly ? 'monthly' : 'yearly'].pro}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {isMonthly ? 'Billed monthly' : 'Billed annually'}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-infinity"></i></span> Unlimited statement uploads</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-brain"></i></span> Advanced AI insights</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-chart-pie"></i></span> Budget planning & alerts</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-file-export"></i></span> PDF/Excel exports</li>
                <li className="flex items-center gap-2"><span className="text-purple-500"><i className="fas fa-headset"></i></span> Priority support</li>
              </ul>
            </div>
            <button 
              onClick={() => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                  alert('🔒 Please login first to upgrade your plan.');
                } else {
                  alert('💳 Please visit your dashboard to upgrade your plan with secure payment.');
                }
              }}
              className="mt-6 w-full text-white font-medium py-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-400 hover:opacity-90 transition"
            >
              Get Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-pink-400 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-pink-500 to-indigo-500 p-2 rounded-full">
                  <i className="fas fa-cogs text-white"></i>
                </div>
                <h3 className="text-lg font-semibold">Enterprise</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Designed for businesses requiring comprehensive, scalable management tools.</p>
              <p className="text-2xl font-bold mb-1">
                {pricingData[isMonthly ? 'monthly' : 'yearly'].enterprise}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {isMonthly ? 'Billed monthly' : 'Billed annually'}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-star"></i></span> Everything in Premium</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-receipt"></i></span> GST expense tracking</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-chart-bar"></i></span> P&L statements</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-file-invoice"></i></span> Invoice management</li>
                <li className="flex items-center gap-2"><span className="text-blue-500"><i className="fas fa-users"></i></span> Team collaboration</li>
              </ul>
            </div>
            <button 
              onClick={() => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                  alert('🔒 Please login first to upgrade your plan.');
                } else {
                  alert('📧 Contact our sales team at sales@fintrackai.com for Enterprise plan!');
                }
              }}
              className="mt-6 w-full bg-gradient-to-br from-pink-500 to-indigo-500 text-white font-medium py-2 rounded-md hover:opacity-90 transition"
            >
              Get Enterprise
            </button>
          </div>
        </div>

        {/* Features Section */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-blue-400 p-3 rounded-full">
                    <i className="fas fa-phone-alt text-white"></i>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Nulla vitae elit libero, a pharetra augue. Donec id elit non mi porta gravida at eget. Fusce dapibus tellus.
                </p>
                <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
                  Learn More →
                </a>
              </div>

              <div>
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-400 p-3 rounded-full">
                    <i className="fas fa-briefcase text-white"></i>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">Daily Updates</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet. Sed posuere consectetur.
                </p>
                <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
                  Learn More →
                </a>
              </div>

              <div>
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="bg-gradient-to-br from-pink-500 to-indigo-500 p-3 rounded-full">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">Market Research</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo cursus magna scelerisque.
                </p>
                <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
                  Learn More →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Pricing FAQ</h2>
            <p className="text-gray-500 text-sm mb-10">
              If you don't see an answer to your question, you can send us an{' '}
              <a href="#" className="text-blue-600 hover:underline">
                email
              </a>{' '}
              from our contact form.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Can I cancel my subscription?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Yes, you can cancel anytime through your dashboard settings.</p>
                </details>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    How do I get my subscription receipt?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Receipts are emailed monthly and available in your billing section.</p>
                </details>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Which payment methods do you accept?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">We accept credit cards, PayPal, and more.</p>
                </details>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Are there any discounts for people in need?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Yes! We offer educational and nonprofit discounts.</p>
                </details>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    How can I manage my Account?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">You can manage your account settings via the dashboard.</p>
                </details>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Do you offer a free trial edit?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Yes, a 7-day free trial is available on the Pro plan.</p>
                </details>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    Is my credit card information secure?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">We use Stripe and follow strict PCI compliance.</p>
                </details>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800">
                    How do I reset my Account password?
                    <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">Click on "Forgot Password?" at login to reset securely.</p>
                </details>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default MainPricing;