import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUserStatus, startAuthMonitoring } from '../utils/authCheck';
import { getDashboardAnalytics } from '../api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [categoryData, setCategoryData] = useState({});
  const [transactionCount, setTransactionCount] = useState(0);
  const [timePeriod, setTimePeriod] = useState('all');
  const [enhancedAnalytics, setEnhancedAnalytics] = useState(null);
  const navigate = useNavigate();

  const spendingChartRef = useRef(null);
  const spendingChartInstance = useRef(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { navigate('/login'); return; }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/generate`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success && data.report) {
          const txs = data.report.map(tx => ({
            id: tx._id,
            description: tx.description,
            date: new Date(tx.date),
            amount: tx.amount,
            type: tx.type,
            category: getCategoryFromDescription(tx.description)
          }));

          setTransactions(txs);
          processTransactions(txs);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };

    const fetchEnhancedAnalytics = async () => {
      try {
        const result = await getDashboardAnalytics(timePeriod);
        if (result?.success) {
          setEnhancedAnalytics(result.data);
        }
      } catch (err) {
        console.warn('Enhanced analytics unavailable:', err.message);
      }
    };

    fetchTransactions();
    fetchEnhancedAnalytics();
    checkUserStatus();
    startAuthMonitoring();
  }, [navigate, timePeriod]);

  const processTransactions = (txs) => {
    const spending = txs.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const income = txs.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    setTotalSpending(spending);
    setTotalIncome(income);
    setTransactionCount(txs.length);

    const categories = {};
    txs.forEach(tx => {
      if (tx.type === 'debit') {
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      }
    });
    setCategoryData(categories);
  };

  const getCategoryFromDescription = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('salary') || desc.includes('income')) return "Income";
    if (desc.includes('food') || desc.includes('zomato') || desc.includes('swiggy') || desc.includes('restaurant')) return "Food & Dining";
    if (desc.includes('rent') || desc.includes('housing')) return "Housing";
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping')) return "Shopping";
    if (desc.includes('bill') || desc.includes('recharge') || desc.includes('electricity')) return "Utilities";
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('fuel') || desc.includes('petrol')) return "Transport";
    return "Other";
  };

  useEffect(() => {
    const initChart = async () => {
      if (!transactions.length || !spendingChartRef.current) return;

      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      if (spendingChartInstance.current) spendingChartInstance.current.destroy();

      const dates = [...new Set(transactions.map(t => t.date.toLocaleDateString()))].sort((a, b) => new Date(a) - new Date(b)).slice(-7);
      const spendingData = dates.map(date =>
        transactions.filter(t => t.date.toLocaleDateString() === date && t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      );

      const ctx = spendingChartRef.current.getContext('2d');
      spendingChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dates.map(d => { const parts = d.split('/'); return `${parts[0]}/${parts[1]}`; }),
          datasets: [{
            label: 'Daily Spending',
            data: spendingData,
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(0, 209, 255, 0.8)');
              gradient.addColorStop(1, 'rgba(0, 255, 148, 0.4)');
              return gradient;
            },
            borderRadius: 6,
            barThickness: 24,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#111',
              titleColor: '#fff',
              bodyColor: '#888',
              borderColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              callbacks: {
                label: (ctx) => `₹${ctx.parsed.y.toLocaleString()}`
              }
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: { color: '#444', font: { size: 11 } },
              border: { display: false }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#444', font: { size: 11 } },
              border: { display: false }
            }
          }
        }
      });
    };
    initChart();
  }, [transactions]);

  // Computed metrics from real data
  const netBalance = totalIncome - totalSpending;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

  // Top category
  const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in translate-y-[-10%]">
        <div className="w-12 h-12 border-4 border-white/5 border-t-[var(--accent-primary)] rounded-full animate-spin mb-6"></div>
        <div className="text-center">
          <p className="text-sm font-bold text-white tracking-widest uppercase">Initializing Dashboard</p>
          <p className="text-[11px] text-[#444] mt-2">Syncing your financial intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Financial Overview</h1>
        <p className="text-sm text-[#555] mt-1">Your spending analytics powered by AI</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All Time', value: 'all' },
          { label: '90 Days', value: '90d' },
          { label: '30 Days', value: '30d' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setTimePeriod(option.value)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold tracking-wider border transition-all ${
              timePeriod === option.value
                ? 'border-[var(--accent-primary)] text-white bg-[var(--accent-primary)]/10'
                : 'border-white/[0.06] text-[#555] bg-white/[0.02]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stat Cards — all real computed data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="section-label mb-2">Total Spending</p>
          <p className="text-xl font-bold text-white">₹{totalSpending.toLocaleString()}</p>
          <p className="text-[11px] text-[#555] mt-1">{transactionCount} transactions</p>
        </div>
        <div className="stat-card">
          <p className="section-label mb-2">Total Income</p>
          <p className="text-xl font-bold text-[var(--accent-secondary)]">₹{totalIncome.toLocaleString()}</p>
          <p className="text-[11px] text-[#555] mt-1">credited</p>
        </div>
        <div className="stat-card">
          <p className="section-label mb-2">Net Balance</p>
          <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-[var(--accent-secondary)]' : 'text-[var(--accent-danger)]'}`}>
            {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#555] mt-1">{savingsRate}% savings rate</p>
        </div>
        <div className="stat-card">
          <p className="section-label mb-2">Top Category</p>
          <p className="text-xl font-bold text-white">{topCategory ? topCategory[0] : '—'}</p>
          <p className="text-[11px] text-[#555] mt-1">
            {topCategory ? `₹${topCategory[1].toLocaleString()}` : 'No data'}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spending Chart */}
        <div className="lg:col-span-8">
          <div className="cashmate-card h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Spending Analysis</h3>
                <p className="text-[11px] text-[#555] mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-[#444]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"></div> EXPENSES
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <canvas ref={spendingChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-4">
          <div className="cashmate-card flex flex-col max-h-[400px]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <button
                onClick={() => navigate('/transaction')}
                className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline"
              >
                VIEW ALL
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
              {transactions.slice(0, 8).map((tx, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      tx.type === 'debit'
                        ? 'bg-white/[0.04] text-[#888]'
                        : 'bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]'
                    }`}>
                      <i className={`fas ${tx.type === 'debit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-[140px] group-hover:text-[var(--accent-primary)] transition-colors">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-[#444] font-medium">
                        {tx.category} • {tx.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold whitespace-nowrap ${tx.type === 'debit' ? 'text-white' : 'text-[var(--accent-secondary)]'}`}>
                    {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-10">
                  <i className="fas fa-inbox text-2xl text-[#333] mb-3 block"></i>
                  <p className="text-sm text-[#444]">No transactions yet</p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline mt-2"
                  >
                    Upload a statement →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryData).length > 0 && (
        <div className="cashmate-card">
          <h3 className="text-sm font-bold text-white mb-5">Spending by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(categoryData)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount], i) => {
                const percentage = totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(0) : 0;
                return (
                  <div key={cat} className="bg-white/[0.02] rounded-xl p-4 hover:bg-white/[0.04] transition-all">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">{cat}</p>
                    <p className="text-base font-bold text-white mb-1">₹{amount.toLocaleString()}</p>
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-[#444] mt-1">{percentage}%</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {enhancedAnalytics?.summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="section-label mb-2">Avg Monthly Spend</p>
              <p className="text-xl font-bold text-white">
                ₹{Number(enhancedAnalytics.summary.averageMonthlySpending || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-[#555] mt-1">Based on {enhancedAnalytics.summary.monthlyTrend?.length || 0} months</p>
            </div>
            <div className="stat-card">
              <p className="section-label mb-2">Savings Rate</p>
              <p className="text-xl font-bold text-[var(--accent-secondary)]">
                {enhancedAnalytics.summary.totals?.savingsRate || 0}%
              </p>
              <p className="text-[11px] text-[#555] mt-1">Net savings ₹{Number(enhancedAnalytics.summary.totals?.netSavings || 0).toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="section-label mb-2">Smart Category</p>
              <p className="text-xl font-bold text-white">{enhancedAnalytics.summary.topCategory?.category || '—'}</p>
              <p className="text-[11px] text-[#555] mt-1">
                ₹{Number(enhancedAnalytics.summary.topCategory?.amount || 0).toLocaleString()} tracked
              </p>
            </div>
          </div>

          {enhancedAnalytics.savingsInsights?.length > 0 && (
            <div className="cashmate-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Savings Opportunities</h3>
                  <p className="text-[11px] text-[#555] mt-1">Auto-generated from your transaction history</p>
                </div>
                <span className="badge badge-success">AI + Rules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enhancedAnalytics.savingsInsights.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.04]">
                    <p className="text-sm font-bold text-white mb-2">{item.title}</p>
                    <p className="text-[12px] text-[#888] leading-relaxed mb-3">{item.description}</p>
                    <p className="text-[11px] font-bold text-[var(--accent-primary)]">
                      Estimated monthly impact: ₹{Math.max(0, Number(item.estimatedMonthlySaving || 0)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {enhancedAnalytics.categoryInsights?.length > 0 && (
            <div className="cashmate-card">
              <h3 className="text-sm font-bold text-white mb-5">Category Intelligence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {enhancedAnalytics.categoryInsights.slice(0, 3).map((item) => (
                  <div key={item.category} className="bg-white/[0.02] rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">#{item.rank} {item.category}</p>
                    <p className="text-xl font-bold text-white mb-1">₹{Number(item.amount || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-[#555]">{item.share}% of tracked spending</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
