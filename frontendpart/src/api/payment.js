import { API_BASE_URL, getDefaultHeaders } from './config.js';

// Load Razorpay checkout script dynamically
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// --------------------------------------------------------------------------
// createRazorpayOrder — calls backend to create a Razorpay order
// --------------------------------------------------------------------------
export const createRazorpayOrder = async ({ plan, billing }) => {
  const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ plan, billing }),
  });
  return response.json();
};

// --------------------------------------------------------------------------
// verifyRazorpayPayment — sends signature to backend for verification
// --------------------------------------------------------------------------
export const verifyRazorpayPayment = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(payload),
  });
  return response.json();
};

// --------------------------------------------------------------------------
// openRazorpayCheckout
// Full end-to-end: create order → open checkout → verify → return result
//
// options: { plan, billing, userInfo: { name, email } }
// Returns: { success, message, data? }
// --------------------------------------------------------------------------
export const openRazorpayCheckout = async ({ plan, billing, userInfo }) => {
  // 1. Load SDK
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    return { success: false, message: 'Razorpay SDK failed to load. Check your internet connection.' };
  }

  // 2. Create order on backend
  const orderData = await createRazorpayOrder({ plan, billing });
  if (!orderData.success) {
    return { success: false, message: orderData.message || 'Could not create payment order' };
  }

  const { order, keyId, amount } = orderData;

  // 3. Open Razorpay checkout and wait for result
  return new Promise((resolve) => {
    const handler = window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: 'FinTrackAI',
      description: `${plan} Plan — ${billing === 'yearly' ? 'Annual' : 'Monthly'}`,
      image: 'https://fin-track-ai-secure.vercel.app/favicon.ico',
      prefill: {
        name: userInfo?.name || '',
        email: userInfo?.email || '',
      },
      theme: { color: '#00D1FF' },

      handler: async (response) => {
        // 4. Verify signature on backend
        const result = await verifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          plan,
          billing,
          amount: order.amount,
        });
        resolve(result);
      },

      modal: {
        ondismiss: () => resolve({ success: false, message: 'Payment cancelled' }),
      },
    });
    handler.open();
  });
};

// --------------------------------------------------------------------------
// getSubscriptionStatus
// --------------------------------------------------------------------------
export const getSubscriptionStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/subscription/status`, {
    headers: getDefaultHeaders(),
  });
  return response.json();
};

// --------------------------------------------------------------------------
// getPaymentHistory
// --------------------------------------------------------------------------
export const getPaymentHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/payment/history`, {
    headers: getDefaultHeaders(),
  });
  return response.json();
};

// --------------------------------------------------------------------------
// getPlanLimits
// --------------------------------------------------------------------------
export const getPlanLimits = async () => {
  const response = await fetch(`${API_BASE_URL}/user/plan-limits`, {
    headers: getDefaultHeaders(),
  });
  return response.json();
};
