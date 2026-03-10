import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from '../components/Footer';
import { generateInsights } from '../api/insights';

const Insights = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Fetch transactions and generate insights
  useEffect(() => {
    fetchInsights();
  }, []);
  
  const fetchInsights = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions from the reports endpoint
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reports/generate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.report && data.report.length > 0) {
        // Process transactions
        const txs = data.report.map(tx => ({
          id: tx._id,
          description: tx.description,
          date: new Date(tx.date),
          amount: tx.amount,
          type: tx.type,
          balance: tx.balance,
          category: getCategoryFromDescription(tx.description)
        }));
        
        setTransactions(txs);
        
        // Generate insights
        const insightsResult = await generateInsights(txs);
        
        if (insightsResult.success) {
          setInsights(insightsResult.insights);
        } else {
          setError(insightsResult.error || 'Failed to generate insights');
          setInsights(insightsResult.insights || []); // Use fallback insights
        }
      } else {
        // Default insights for new users
        setInsights([
          {
            title: "Start Tracking Expenses",
            description: "Begin by recording all your expenses to understand your spending patterns.",
            category: "Budgeting",
            savingPotential: 5000
          },
          {
            title: "Create a Budget Plan",
            description: "Set monthly spending limits for different categories to control expenses.",
            category: "Planning",
            savingPotential: 3000
          },
          {
            title: "Build Emergency Fund",
            description: "Save 3-6 months of expenses for unexpected situations.",
            category: "Savings",
            savingPotential: 10000
          }
        ]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
      // Fallback insights
      setInsights([
        {
          title: "Reduce Food Expenses",
          description: "Try meal planning and cooking at home to save on food costs.",
          category: "Food & Dining",
          savingPotential: 2000
        },
        {
          title: "Review Subscriptions",
          description: "Cancel unused subscriptions and services to save monthly.",
          category: "Entertainment",
          savingPotential: 1500
        },
        {
          title: "Use Public Transport",
          description: "Consider using public transportation to save on fuel and parking costs.",
          category: "Transportation",
          savingPotential: 3000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to determine category based on description
  const getCategoryFromDescription = (description) => {
    const desc = description.toLowerCase();
    
    if (desc.includes('salary')) return "Income";
    if (desc.includes('deposit') || desc.includes('transfer from') || desc.includes('cheque')) return "Income";
    if (desc.includes('atm') || desc.includes('withdrawal')) return "Cash";
    if (desc.includes('rent') || desc.includes('housing')) return "Housing";
    if (desc.includes('bazaar') || desc.includes('grocery')) return "Food & Dining";
    if (desc.includes('zomato') || desc.includes('swiggy')) return "Food & Dining";
    if (desc.includes('jio') || desc.includes('recharge')) return "Utilities";
    if (desc.includes('power') || desc.includes('bill')) return "Utilities";
    if (desc.includes('card payment')) return "Credit Card";
    if (desc.includes('upi') || desc.includes('amazon')) return "Shopping";
    
    return "Other";
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    await fetchInsights();
    setIsGenerating(false);
  };

  // Financial tips array - will randomly select 3
  const financialTips = [
    "Track your spending daily to identify patterns and opportunities for savings.",
    "Set up automatic transfers to your savings account to build wealth consistently.",
    "Review your subscriptions monthly to eliminate unnecessary expenses.",
    "Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
    "Pay off high-interest debt first to minimize interest payments.",
    "Create a separate emergency fund with 3-6 months of living expenses.",
    "Consider using cash for discretionary spending to be more mindful of purchases.",
    "Meal prep at home to reduce food delivery and dining out expenses.",
    "Use price comparison apps when shopping to find the best deals.",
    "Set specific financial goals with deadlines to stay motivated.",
    "Automate bill payments to avoid late fees and maintain good credit.",
    "Invest early and regularly, even small amounts benefit from compound growth.",
    "Negotiate bills and subscriptions annually to get better rates.",
    "Use cashback credit cards for regular purchases, but pay off the balance monthly.",
    "Consider a no-spend challenge for a week each month to reset spending habits."
  ];
  
  // Select 3 random tips
  const getRandomTips = () => {
    const shuffled = [...financialTips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };
  
  const [tips, setTips] = useState(getRandomTips());
  
  // Update tips when insights are refreshed
  useEffect(() => {
    setTips(getRandomTips());
  }, [insights]);
  
  // Calculate total savings potential
  const totalSavings = insights.reduce((sum, insight) => sum + insight.savingPotential, 0);

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left section: Insights */}
          <section className="md:col-span-2 flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">AI Financial Insights</h1>
                <p className="text-sm text-slate-500 mt-1">Get personalized recommendations and discover spending patterns</p>
              </div>
              <button
                id="generateBtn"
                className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3 md:mt-0"
                onClick={handleGenerateInsights}
                disabled={isGenerating || loading}
              >
                {isGenerating || loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Generate New Insights
                  </>
                )}
              </button>
            </header>
            
            {loading && !isGenerating ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading AI insights...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-5 border border-red-300">
                <p className="text-red-600">Error: {error}</p>
              </div>
            ) : (
              insights.map((insight, index) => {
                // Determine card style based on insight type
                let cardStyle = "border-blue-300";
                let iconColor = "text-blue-600";
                let iconPath = "M9 12l2 2 4-4m6 0a9 9 0 11-18 0 9 9 0 0118 0z";
                let badgeStyle = "bg-blue-100 text-blue-700";
                let badgeText = "Insight";
                
                if (insight.title.toLowerCase().includes("reduce") || 
                    insight.title.toLowerCase().includes("high") || 
                    insight.title.toLowerCase().includes("alert")) {
                  cardStyle = "border-red-300";
                  iconColor = "text-red-600";
                  iconPath = "M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728";
                  badgeStyle = "bg-red-100 text-red-700";
                  badgeText = "Warning";
                } else if (insight.title.toLowerCase().includes("save") || 
                           insight.title.toLowerCase().includes("opportunity")) {
                  cardStyle = "border-green-300";
                  iconColor = "text-green-600";
                  iconPath = "M9 12l2 2 4-4m0 6a6 6 0 11-12 0 6 6 0 0112 0z";
                  badgeStyle = "bg-amber-100 text-amber-700";
                  badgeText = "Suggestion";
                }
                
                return (
                  <article key={index} className={`bg-white rounded-lg shadow p-5 border border-transparent hover:${cardStyle} transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 ${iconColor}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={iconPath}
                          />
                        </svg>
                        <h2 className="font-semibold text-slate-900 text-sm">{insight.title}</h2>
                        <span className={`text-xs ${badgeStyle} rounded-md px-2 py-0.5 font-semibold uppercase tracking-wide select-none`}>
                          {badgeText}
                        </span>
                        <span className="text-xs bg-slate-200 text-slate-700 rounded-md px-2 py-0.5 font-semibold">AI Generated</span>
                      </div>
                    </div>
                    <p className="text-slate-700 mt-3 text-sm leading-snug max-w-xl">{insight.description}</p>
                    <div className="mt-4 text-slate-600 text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <div className="space-x-1">
                        <span className="font-semibold text-slate-900">Category:</span>
                        <span>{insight.category}</span>
                      </div>
                      <div className="text-green-700 font-semibold">₹{insight.savingPotential.toFixed(2)}</div>
                      <div>{new Date().toLocaleDateString()}</div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
          
          {/* Right section: Stats and Tips */}
          <aside className="flex flex-col gap-6">
            <section className="bg-white rounded-lg shadow p-5">
              <header className="flex items-center gap-2 mb-3">
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                  />
                </svg> */}
                <h3 className="font-semibold text-slate-900 text-base">Quick Stats</h3>
              </header>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex justify-between">
                  <span>Total Insights</span>
                  <span className="font-semibold">{insights.length}</span>
                </li>
                <li className="flex justify-between">
                  <span>Potential Savings</span>
                  <span className="font-semibold text-green-600">₹{totalSavings.toFixed(2)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Savings Goal</span>
                  <span className="font-semibold text-blue-600">₹{(totalSavings * 1.5).toFixed(2)}</span>
                </li>
              </ul>
            </section>
            <section className="bg-white rounded-lg shadow p-5">
              <header className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M12 12h.01"
                    />
                  </svg>
                  <h3 className="font-semibold text-slate-900 text-base">Financial Tips</h3>
                </div>
                <button 
                  onClick={() => setTips(getRandomTips())}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </header>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="bg-blue-100 rounded-md px-3 py-2 leading-tight">
                  {tips[0]}
                </li>
                <li className="bg-green-100 rounded-md px-3 py-2 leading-tight">
                  {tips[1]}
                </li>
                <li className="bg-amber-100 rounded-md px-3 py-2 leading-tight">
                  {tips[2]}
                </li>
              </ul>
              
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Insights;