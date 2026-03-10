import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRazorpayPayment = () => {
    const token = localStorage.getItem('authToken');
    const userInfoString = localStorage.getItem('userInfo');
    
    if (!token || !userInfoString) {
      alert('❌ AUTHENTICATION REQUIRED\n\nPlease refresh the page and try again.');
      return;
    }
    
    if (!window.Razorpay) {
      alert('❌ PAYMENT SYSTEM UNAVAILABLE\n\nPlease refresh the page and try again.');
      return;
    }

    const amount = isMonthly ? 199 : 2148; // Yearly with 10% discount
    
    let userInfo;
    try {
      userInfo = JSON.parse(userInfoString || '{}');
      if (!userInfo.email || !userInfo.name) {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      alert('Invalid user session. Please refresh the page.');
      return;
    }
    
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: amount * 100,
      currency: 'INR',
      name: 'Fintack AI',
      description: `Pro Plan - ${isMonthly ? 'Monthly' : 'Yearly'}`,
      image: '/logo.png',
      handler: async function (response) {
        try {
          const currentToken = localStorage.getItem('authToken');
          if (!currentToken) {
            alert('Authentication lost. Please refresh the page.');
            return;
          }
          
          const paymentResult = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/payment/process`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || 'demo_order_' + Date.now(),
              amount: amount * 100,
              plan: 'Pro',
              billing: isMonthly ? 'monthly' : 'yearly'
            })
          });

          const paymentData = await paymentResult.json();
          
          if (paymentData.success) {
            alert(`🎉 Payment Successful! Welcome to Pro Plan!\n\nPlan: ${paymentData.data.plan}\nValid until: ${new Date(paymentData.data.validUntil).toLocaleDateString()}\nNext payment: ${new Date(paymentData.data.nextPayment).toLocaleDateString()}`);
            window.location.reload();
          } else {
            alert(`Payment processing failed: ${paymentData.message}`);
          }
        } catch (error) {
          alert('Payment processing failed. Please contact support.');
        }
      },
      prefill: {
        name: userInfo.name || 'User',
        email: userInfo.email || 'user@example.com',
        contact: userInfo.phone || '9999999999'
      },
      notes: {
        plan: 'Pro',
        billing: isMonthly ? 'monthly' : 'yearly',
        userId: userInfo.id
      },
      theme: {
        color: '#8B5CF6'
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const userPlan = JSON.parse(localStorage.getItem('userInfo') || '{}').plan || 'Basic';
  
  const pricingData = {
    monthly: {
      basic: '₹0',
      pro: '₹199',
      enterprise: '₹999',
    },
    yearly: {
      basic: '₹0',
      pro: '₹2,148', // 199 * 12 * 0.9 (10% discount)
      enterprise: '₹10,788', // 999 * 12 * 0.9 (10% discount)
    },
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
          <i className="fas fa-crown text-white text-xl"></i>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Upgrade Your Plan
        </h2>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Unlock powerful AI insights and advanced features
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
            isMonthly 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:text-gray-800 shadow-md border border-gray-200'
          }`}
          onClick={() => setIsMonthly(true)}
        >
          Monthly
        </button>
        <button
          className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
            !isMonthly 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:text-gray-800 shadow-md border border-gray-200'
          }`}
          onClick={() => setIsMonthly(false)}
        >
          Yearly
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Current Plan */}
        <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-check text-white text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userPlan} Plan
                </h3>
                <p className="text-sm text-gray-500">Current Plan</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {userPlan === 'Basic' ? pricingData[isMonthly ? 'monthly' : 'yearly'].basic : 
                 userPlan === 'Pro' ? pricingData[isMonthly ? 'monthly' : 'yearly'].pro : 
                 pricingData[isMonthly ? 'monthly' : 'yearly'].enterprise}
              </span>
              <span className="text-gray-500">/{isMonthly ? 'month' : 'year'}</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
            {userPlan === 'Basic' ? (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-upload text-green-500 w-5"></i>
                  <span className="text-gray-700">5 statements per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-robot text-green-500 w-5"></i>
                  <span className="text-gray-700">Basic AI categorization</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-chart-bar text-green-500 w-5"></i>
                  <span className="text-gray-700">Simple dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-clock text-green-500 w-5"></i>
                  <span className="text-gray-700">7-day data retention</span>
                </li>
              </>
            ) : userPlan === 'Pro' ? (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-infinity text-green-500 w-5"></i>
                  <span className="text-gray-700">Unlimited uploads</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-brain text-green-500 w-5"></i>
                  <span className="text-gray-700">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-chart-pie text-green-500 w-5"></i>
                  <span className="text-gray-700">Budget planning & alerts</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-file-export text-green-500 w-5"></i>
                  <span className="text-gray-700">PDF/Excel exports</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-star text-green-500 w-5"></i>
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-users text-green-500 w-5"></i>
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-shield-alt text-green-500 w-5"></i>
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-cogs text-green-500 w-5"></i>
                  <span className="text-gray-700">Custom integrations</span>
                </li>
              </>
            )}
          </ul>

          <button className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-semibold cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Upgrade Plan */}
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
            {userPlan === 'Basic' ? 'Most Popular' : 'Enterprise'}
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <i className={`fas ${userPlan === 'Basic' ? 'fa-rocket' : 'fa-building'} text-white text-lg`}></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userPlan === 'Basic' ? 'Pro Plan' : 'Enterprise Plan'}
                </h3>
                <p className="text-sm text-purple-600">
                  {userPlan === 'Basic' ? 'Recommended' : 'For Teams'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {userPlan === 'Basic' ? pricingData[isMonthly ? 'monthly' : 'yearly'].pro : pricingData[isMonthly ? 'monthly' : 'yearly'].enterprise}
              </span>
              <span className="text-gray-500">/{isMonthly ? 'month' : 'year'}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isMonthly ? 'Billed monthly' : 'Billed annually'}
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
            {userPlan === 'Basic' ? (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-infinity text-purple-500 w-5"></i>
                  <span className="text-gray-700">Unlimited uploads</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-brain text-purple-500 w-5"></i>
                  <span className="text-gray-700">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-chart-pie text-purple-500 w-5"></i>
                  <span className="text-gray-700">Budget planning & alerts</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-file-export text-purple-500 w-5"></i>
                  <span className="text-gray-700">PDF/Excel exports</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-headset text-purple-500 w-5"></i>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-3">
                  <i className="fas fa-star text-orange-500 w-5"></i>
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-users text-orange-500 w-5"></i>
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-shield-alt text-orange-500 w-5"></i>
                  <span className="text-gray-700">24/7 Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-cogs text-orange-500 w-5"></i>
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-database text-orange-500 w-5"></i>
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
              </>
            )}
          </ul>

          <button 
            onClick={() => {
              if (userPlan === 'Basic') {
                handleRazorpayPayment();
              } else {
                alert('📧 Contact our sales team at sales@fintrackai.com for Enterprise plan!');
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {userPlan === 'Basic' ? 'Upgrade to Pro' : 'Contact Sales'}
          </button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          🔒 Secure payment powered by Razorpay • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default DashboardPricing;