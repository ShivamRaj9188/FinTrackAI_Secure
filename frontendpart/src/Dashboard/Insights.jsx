import { useState, useEffect } from 'react';
import { generateInsights } from '../api/insights';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState('');
  const [dataQuality, setDataQuality] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reports/generate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      const insightsResult = await generateInsights(data.report || []);
      if (insightsResult.insights && insightsResult.insights.length > 0) {
        setInsights(insightsResult.insights);
        setSource(insightsResult.source || 'unknown');
        setDataQuality(insightsResult.dataQuality || null);
        setError(null);
      } else {
        setInsights([]);
        setError(null);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const categoryIcons = {
    'Food & Dining': 'fa-utensils',
    'Shopping': 'fa-shopping-bag',
    'Housing': 'fa-home',
    'Transport': 'fa-car',
    'Transportation': 'fa-car',
    'Utilities': 'fa-bolt',
    'Budgeting': 'fa-chart-bar',
    'Savings': 'fa-piggy-bank',
    'Entertainment': 'fa-film',
    'Health': 'fa-heart-pulse',
    'Education': 'fa-graduation-cap',
    'Income': 'fa-coins',
    'General': 'fa-chart-line',
    'Getting Started': 'fa-rocket',
  };

  const confidenceConfig = {
    high: { label: 'HIGH CONFIDENCE', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    medium: { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    low: { label: 'LOW', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  };

  const sourceLabels = {
    'gemini': { label: 'GEMINI AI', icon: 'fa-wand-magic-sparkles', color: 'text-purple-400' },
    'rule-based': { label: 'RULE-BASED', icon: 'fa-calculator', color: 'text-blue-400' },
    'fallback': { label: 'FALLBACK', icon: 'fa-shield-halved', color: 'text-yellow-400' },
    'client-fallback': { label: 'LOCAL', icon: 'fa-laptop', color: 'text-orange-400' },
    'empty': { label: 'NO DATA', icon: 'fa-database', color: 'text-[#555]' },
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <div className="h-8 w-48 skeleton"></div>
        <div className="h-4 w-64 skeleton"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 skeleton rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const srcInfo = sourceLabels[source] || sourceLabels['rule-based'];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Insights</h1>
            <span className={`badge ${source === 'gemini' ? 'badge-info' : 'badge-neutral'} text-[8px]`}>
              <i className={`fas ${srcInfo.icon} text-[8px]`}></i>
              {srcInfo.label}
            </span>
          </div>
          <p className="text-sm text-[#555]">Personalized recommendations based on your spending patterns</p>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="btn-primary px-5 py-2.5 rounded-xl text-[13px] disabled:opacity-50"
        >
          {refreshing ? (
            <span className="flex items-center gap-2">
              <i className="fas fa-spinner fa-spin text-xs"></i>
              ANALYZING...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fas fa-rotate text-xs"></i>
              REFRESH
            </span>
          )}
        </button>
      </div>

      {/* Data Quality Bar */}
      {dataQuality && (
        <div className="cashmate-card !p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#444] tracking-widest uppercase">Data Quality</span>
            <span className="text-[10px] font-bold text-[#555]">{dataQuality.transactions} transactions • {dataQuality.categories || 0} categories</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, dataQuality.score)}%`,
                background: dataQuality.score >= 70 ? 'linear-gradient(90deg, #10b981, #00d1ff)' :
                  dataQuality.score >= 40 ? 'linear-gradient(90deg, #eab308, #f59e0b)' :
                    'linear-gradient(90deg, #ef4444, #f97316)'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-fade-in">
          <i className="fas fa-exclamation-circle text-red-400 text-sm"></i>
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Insight Cards */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const conf = confidenceConfig[insight.confidence] || confidenceConfig.medium;
          return (
            <div
              key={index}
              className="glow-card group animate-fade-in-up p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors mb-2">
                    {insight.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-neutral">
                      <i className={`fas ${categoryIcons[insight.category] || 'fa-tag'} text-[8px]`}></i>
                      {insight.category}
                    </span>
                    {insight.savingPotential > 0 && (
                      <span className="badge badge-success">
                        <i className="fas fa-arrow-trend-down text-[8px]"></i>
                        SAVE ₹{insight.savingPotential?.toLocaleString() || '0'}
                      </span>
                    )}
                    {insight.confidence && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-bold tracking-wider ${conf.bg}`}>
                        <i className={`fas fa-shield-halved ${conf.color} text-[7px]`}></i>
                        <span className={conf.color}>{conf.label}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fas fa-lightbulb text-[var(--accent-primary)]"></i>
                </div>
              </div>

              <p className="text-sm text-[#888] leading-relaxed mb-3">
                {insight.description}
              </p>

              {/* Reasoning — Explainability */}
              {insight.reasoning && (
                <div className="flex items-start gap-2 pt-3 border-t border-white/[0.04]">
                  <i className="fas fa-circle-info text-[10px] text-[#333] mt-0.5"></i>
                  <p className="text-[11px] text-[#444] leading-relaxed italic">
                    {insight.reasoning}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {insights.length === 0 && !error && (
          <div className="cashmate-card text-center py-16">
            <i className="fas fa-wand-magic-sparkles text-3xl text-[#222] mb-4 block"></i>
            <h3 className="text-base font-bold text-white mb-2">No Insights Available</h3>
            <p className="text-sm text-[#555] max-w-sm mx-auto">
              Upload a bank statement first, then come back here for AI-powered financial insights.
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="text-center pt-6 space-y-1">
        <p className="text-[10px] font-medium text-[#333] tracking-wider">
          <i className="fas fa-sparkles text-[8px] mr-1"></i>
          {source === 'gemini' ? 'POWERED BY GOOGLE GEMINI 2.0 FLASH' : 'RULE-BASED ANALYSIS ENGINE'}
        </p>
        <p className="text-[9px] text-[#222]">
          Insights are for informational purposes only. Not financial advice. Always consult a professional.
        </p>
      </div>
    </div>
  );
};

export default Insights;