import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Reports = () => {
  const location = useLocation();
  const [reportData, setReportData] = useState(location.state?.reportData || []);
  const [loading, setLoading] = useState(!location.state?.reportData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location.state?.reportData) {
      const fetchReport = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const urlParams = new URLSearchParams(window.location.search);
          const fileId = urlParams.get('fileId');
          const url = `${import.meta.env.VITE_API_URL}/reports/generate${fileId ? `?fileId=${fileId}` : ''}`;

          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) setReportData(data.report);
          else setError(data.message);
        } catch (err) { setError('Failed to load report data'); }
        finally { setLoading(false); }
      };
      fetchReport();
    }
  }, [location.state]);

  const totalSpending = reportData.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = reportData.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalSpending;

  const handleExportCSV = () => {
    if (!reportData.length) return;

    const headers = ['Date', 'Description', 'Type', 'Amount', 'Balance'];
    const rows = reportData.map(t => [
      new Date(t.date).toLocaleDateString(),
      `"${t.description}"`,
      t.type,
      t.amount,
      t.balance || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FinTrackAI_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
        <div className="h-8 w-48 skeleton"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl"></div>)}
        </div>
        <div className="h-96 skeleton rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Report</h1>
          <p className="text-sm text-[#555] mt-1">{reportData.length} transactions analyzed</p>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={handleExportCSV}
            disabled={!reportData.length}
            className="btn-secondary px-5 py-2.5 rounded-xl text-[13px] disabled:opacity-30"
          >
            <i className="fas fa-download text-xs"></i>
            EXPORT CSV
          </button>
          <button
            onClick={handlePrintPDF}
            disabled={!reportData.length}
            className="btn-primary px-5 py-2.5 rounded-xl text-[13px] disabled:opacity-30"
          >
            <i className="fas fa-print text-xs"></i>
            PRINT PDF
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
          <i className="fas fa-exclamation-circle text-red-400 text-sm"></i>
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="section-label mb-2">Total Spending</p>
          <p className="text-2xl font-black text-white">₹{totalSpending.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="section-label mb-2">Total Income</p>
          <p className="text-2xl font-black text-[var(--accent-secondary)]">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="section-label mb-2">Net Balance</p>
          <p className={`text-2xl font-black ${netBalance >= 0 ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-danger)]'}`}>
            {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="cashmate-card overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-5">Statement Details</h3>
        {reportData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-[#444] tracking-widest uppercase border-b border-white/[0.04]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {reportData.map((t, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 text-xs font-medium text-[#555]">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-white">{t.description}</td>
                    <td className={`px-4 py-3.5 text-right text-sm font-bold ${t.type === 'debit' ? 'text-white' : 'text-[var(--accent-secondary)]'}`}>
                      {t.type === 'debit' ? '-' : '+'}₹{t.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-medium text-[#444]">
                      ₹{t.balance?.toLocaleString() || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-file-lines text-3xl text-[#222] mb-3 block"></i>
            <p className="text-sm text-[#444]">No report data available. Upload a statement first.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;