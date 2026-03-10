import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/subscription/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setSubscription(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  if (loading) return null;
  if (!subscription) return null;

  const { currentPlan, planEndDate, daysRemaining, subscriptionStatus } = subscription;

  // Don't show for basic plan
  if (currentPlan === 'Basic') return null;

  const isExpired = subscriptionStatus === 'expired';
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <div className={`mb-6 p-4 rounded-lg border ${
      isExpired ? 'bg-red-50 border-red-200' : 
      isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 
      'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${
            isExpired ? 'text-red-800' : 
            isExpiringSoon ? 'text-yellow-800' : 
            'text-green-800'
          }`}>
            {currentPlan} Plan
            {isExpired && ' - Expired'}
            {isExpiringSoon && ' - Expiring Soon'}
          </h3>
          <p className={`text-sm ${
            isExpired ? 'text-red-600' : 
            isExpiringSoon ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {isExpired 
              ? `Expired on ${new Date(planEndDate).toLocaleDateString()}`
              : `${daysRemaining} days remaining • Expires ${new Date(planEndDate).toLocaleDateString()}`
            }
          </p>
        </div>
        {(isExpired || isExpiringSoon) && (
          <Link 
            to="/pricing" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Renew Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;