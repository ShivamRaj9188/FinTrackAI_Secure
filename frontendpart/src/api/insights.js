import { API_BASE_URL, getDefaultHeaders } from './config.js';

/**
 * Generate AI insights from user's actual transaction data via backend.
 * Backend handles both Gemini API and rule-based fallback — no hardcoded data here.
 */
export const generateInsights = async (transactions) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_BASE_URL}/insights/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ transactions }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.insights && data.insights.length > 0) {
      return data;
    }

    // If backend returned success but no insights, show empty state
    return {
      success: true,
      insights: [],
      source: 'none',
      note: 'Upload more transactions to get personalized insights'
    };
  } catch (error) {
    console.error('Error generating insights:', error);

    // If we have transactions, compute basic insights client-side as last resort
    if (transactions && transactions.length > 0) {
      return {
        success: true,
        insights: computeClientFallback(transactions),
        source: 'client-fallback',
        note: 'Server unavailable — showing local analysis'
      };
    }

    // No transactions at all — show empty state, NOT hardcoded fake data
    return {
      success: true,
      insights: [],
      source: 'none',
      note: 'Upload a bank statement to get AI-powered insights'
    };
  }
};

/**
 * Client-side fallback — computed from REAL transaction data, not hardcoded.
 * Used only when backend is unreachable AND we have transaction data.
 */
function computeClientFallback(transactions) {
  const spendingByCategory = {};
  let totalSpending = 0;
  let totalIncome = 0;

  transactions.forEach(tx => {
    const amount = parseFloat(tx.amount) || 0;
    if (tx.type === 'debit' || tx.type === 'expense') {
      const category = tx.category || 'Other';
      spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
      totalSpending += amount;
    } else {
      totalIncome += amount;
    }
  });

  const sorted = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1]);
  const insights = [];

  if (sorted.length > 0) {
    const [topCat, topAmt] = sorted[0];
    const pct = totalSpending > 0 ? ((topAmt / totalSpending) * 100).toFixed(0) : 0;
    insights.push({
      title: `High spending on ${topCat}`,
      description: `₹${topAmt.toFixed(0)} spent on ${topCat} (${pct}% of total). Reducing by 15% could save ₹${(topAmt * 0.15).toFixed(0)}/month.`,
      category: topCat,
      savingPotential: Math.round(topAmt * 0.15)
    });
  }

  if (totalIncome > 0) {
    const rate = ((totalIncome - totalSpending) / totalIncome * 100).toFixed(0);
    insights.push({
      title: rate >= 20 ? 'Good savings rate' : 'Low savings rate',
      description: `Your savings rate is ${rate}%. ${rate < 20 ? 'Aim for 20% by reducing discretionary spending.' : 'Keep it up!'}`,
      category: 'General',
      savingPotential: Math.max(0, Math.round(totalIncome * 0.2 - (totalIncome - totalSpending)))
    });
  }

  if (sorted.length >= 2) {
    const [cat2, amt2] = sorted[1];
    insights.push({
      title: `Review ${cat2} expenses`,
      description: `₹${amt2.toFixed(0)} spent on ${cat2}. Check for recurring charges you can eliminate.`,
      category: cat2,
      savingPotential: Math.round(amt2 * 0.1)
    });
  }

  return insights;
}