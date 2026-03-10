import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from '../components/Footer';

const Reports = () => {
  const location = useLocation();
  const [reportType, setReportType] = useState('Monthly Report');
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-07-31');
  const [reportData, setReportData] = useState(location.state?.reportData || null);
  // Show all transactions when dates are auto-set from uploaded data
  const filteredData = reportData || [];
  
  // Log filtered data count
  useEffect(() => {
    if (reportData && reportData.length > 0) {
      console.log(`Filtered ${filteredData.length} out of ${reportData.length} transactions`);
    }
  }, [reportData, filteredData.length]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use report data from navigation state if available
        if (location.state?.reportData) {
          console.log('Using report data from navigation state');
          setReportData(location.state.reportData);
          
          // Auto-set date range if available from navigation state
          if (location.state?.dateRange) {
            setStartDate(location.state.dateRange.startDate);
            setEndDate(location.state.dateRange.endDate);
            console.log('Auto-set date range from navigation:', location.state.dateRange);
          }
          
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('authToken');
        console.log('Fetching report with token:', token ? 'Token exists' : 'No token');
        
        // Get fileId from URL query params if available
        const urlParams = new URLSearchParams(window.location.search);
        const fileId = urlParams.get('fileId');
        
        let url = `${API_BASE_URL}/reports/generate`;
        if (fileId) {
          url += `?fileId=${fileId}`;
        }
        
        console.log('Fetching report from URL:', url);
        
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json();
        console.log('Report API response:', data);
        
        if (data.success) {
          console.log(`Setting report data with ${data.report.length} transactions`);
          setReportData(data.report);
          
          // Auto-set date range if available
          if (data.dateRange) {
            setStartDate(data.dateRange.startDate);
            setEndDate(data.dateRange.endDate);
            console.log('Auto-set date range:', data.dateRange);
          }
        } else {
          setError(data.message || 'Failed to fetch report');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Error fetching report: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [location.state]);

  const exportPDF = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export. Please select a different date range.");
      return;
    }
    
    // Create a printable version of the report
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert("Please allow pop-ups to download the PDF report.");
      return;
    }
    
    // Calculate totals
    const totalDebit = filteredData.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalCredit = filteredData.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    // Generate HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report ${startDate} to ${endDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .debit { color: #dc2626; }
          .credit { color: #16a34a; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 5px; }
          .summary div { margin: 5px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Financial Report</h1>
        <p>Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</p>
        
        <div class="summary">
          <div><strong>Total Transactions:</strong> ${filteredData.length}</div>
          <div><strong>Total Spending:</strong> ₹${totalDebit.toFixed(2)}</div>
          <div><strong>Total Income:</strong> ₹${totalCredit.toFixed(2)}</div>
          <div><strong>Net Balance:</strong> ₹${(totalCredit - totalDebit).toFixed(2)}</div>
        </div>
        
        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Debit (₹)</th>
              <th>Credit (₹)</th>
              <th>Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.description}</td>
                <td class="debit">${t.type === 'debit' ? Number(t.amount).toFixed(2) : ''}</td>
                <td class="credit">${t.type === 'credit' ? Number(t.amount).toFixed(2) : ''}</td>
                <td>${t.balance !== undefined ? Number(t.balance).toFixed(2) : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()} | Fintack AI</p>
        </div>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const exportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export. Please select a different date range.");
      return;
    }
    
    // Create CSV content
    let csvContent = "Date,Description,Category,Type,Amount,Balance\n";
    
    filteredData.forEach(t => {
      const date = new Date(t.date).toLocaleDateString();
      const description = t.description.replace(/,/g, ' '); // Remove commas to avoid CSV issues
      const category = t.category || 'Uncategorized';
      const type = t.type;
      const amount = Number(t.amount).toFixed(2);
      const balance = t.balance !== undefined ? Number(t.balance).toFixed(2) : '';
      
      csvContent += `${date},"${description}",${category},${type},${amount},${balance}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and clean up
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
          <p className="text-sm text-gray-600">Generate detailed financial reports and export your data</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow col-span-1">
            <h2 className="font-semibold text-lg mb-4">Report Filters</h2>
            <label className="block text-sm mb-1">Report Type</label>
            <select
              className="w-full border rounded px-2 py-1 mb-4"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option>Monthly Report</option>
              <option>Weekly Report</option>
            </select>
            <label className="block text-sm mb-1">Date Range</label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="date"
                className="border rounded px-2 py-1 w-1/2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border rounded px-2 py-1 w-1/2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 w-full rounded mb-2"
              onClick={exportPDF}
            >
              Export PDF Report
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 py-1.5 w-full rounded"
              onClick={exportCSV}
            >
              Export CSV Data
            </button>
          </div>
          {/* Stats and Report Data */}
          <div className="md:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading report...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">
                <strong>Error:</strong> {error}<br />
                <span className="block mt-2">Please check your login status and try again.</span>
              </div>
            ) : filteredData && filteredData.length > 0 ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Total Spending</div>
                    <div className="text-2xl font-semibold">
                      ₹{filteredData.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount || 0), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Total Income</div>
                    <div className="text-2xl font-semibold text-green-600">
                      ₹{filteredData.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount || 0), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Transactions</div>
                    <div className="text-2xl font-semibold">{filteredData.length}</div>
                  </div>
                </div>
                {/* Spending Category */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Transaction Categories</h2>
                  <div className="mb-4">
                    <h3 className="font-medium text-red-600 mb-2">Expenses</h3>
                    <ul className="text-sm">
                      {(() => {
                        // First, categorize all transactions
                        const categorizedTransactions = filteredData.filter(t => t.type === 'debit').map(t => {
                          let category = 'Other Expenses';
                          const desc = t.description.toLowerCase();
                          
                          if (desc.includes('atm') || desc.includes('withdrawal')) category = 'Cash Withdrawal';
                          else if (desc.includes('rent')) category = 'Housing';
                          else if (desc.includes('bazaar') || desc.includes('grocery')) category = 'Groceries';
                          else if (desc.includes('zomato') || desc.includes('swiggy')) category = 'Food & Dining';
                          else if (desc.includes('jio') || desc.includes('recharge')) category = 'Mobile & Internet';
                          else if (desc.includes('power') || desc.includes('bill')) category = 'Utilities';
                          else if (desc.includes('card payment')) category = 'Credit Card';
                          else if (desc.includes('upi')) category = 'Online Shopping';
                          else if (t.category) category = t.category;
                          
                          return { ...t, expenseCategory: category };
                        });
                        
                        // Group by category and calculate totals
                        const categories = {};
                        categorizedTransactions.forEach(t => {
                          if (!categories[t.expenseCategory]) {
                            categories[t.expenseCategory] = 0;
                          }
                          categories[t.expenseCategory] += Number(t.amount || 0);
                        });
                        
                        // Calculate total expenses
                        const allDebitTotal = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
                        
                        // Sort categories by amount (descending)
                        return Object.entries(categories)
                          .sort((a, b) => b[1] - a[1])
                          .map(([category, total]) => {
                            const percent = allDebitTotal > 0 ? ((total / allDebitTotal) * 100).toFixed(1) : '0.0';
                            return (
                              <li key={category} className="flex justify-between mb-1">
                                {category} <span className="text-gray-900">₹{total.toFixed(2)} ({percent}%)</span>
                              </li>
                            );
                          });
                      })()}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-green-600 mb-2">Income</h3>
                    <ul className="text-sm">
                      {(() => {
                        // First, categorize all transactions
                        const categorizedTransactions = filteredData.filter(t => t.type === 'credit').map(t => {
                          let category = 'Other Income';
                          const desc = t.description.toLowerCase();
                          
                          if (desc.includes('salary')) category = 'Salary';
                          else if (desc.includes('cash deposit')) category = 'Cash Deposits';
                          else if (desc.includes('cheque')) category = 'Cheque Deposits';
                          else if (desc.includes('transfer')) category = 'Transfers';
                          else if (desc.includes('freelance')) category = 'Freelance Income';
                          else if (desc.includes('deposit')) category = 'Other Deposits';
                          else if (t.category) category = t.category;
                          
                          return { ...t, incomeCategory: category };
                        });
                        
                        // Group by category and calculate totals
                        const categories = {};
                        categorizedTransactions.forEach(t => {
                          if (!categories[t.incomeCategory]) {
                            categories[t.incomeCategory] = 0;
                          }
                          categories[t.incomeCategory] += Number(t.amount || 0);
                        });
                        
                        // Calculate total income
                        const allCreditTotal = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
                        
                        // Sort categories by amount (descending)
                        return Object.entries(categories)
                          .sort((a, b) => b[1] - a[1])
                          .map(([category, total]) => {
                            const percent = allCreditTotal > 0 ? ((total / allCreditTotal) * 100).toFixed(1) : '0.0';
                            return (
                              <li key={category} className="flex justify-between mb-1">
                                {category} <span className="text-gray-900">₹{total.toFixed(2)} ({percent}%)</span>
                              </li>
                            );
                          });
                      })()}
                    </ul>
                  </div>
                </div>
                {/* Recent Transactions */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Transactions Table</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border-b">Date</th>
                          <th className="px-4 py-2 border-b">Description</th>
                          <th className="px-4 py-2 border-b">Category</th>
                          <th className="px-4 py-2 border-b">Debit (₹)</th>
                          <th className="px-4 py-2 border-b">Credit (₹)</th>
                          <th className="px-4 py-2 border-b">Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice().reverse().map((t, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-2">{t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2">{t.description || '-'}</td>
                            <td className="px-4 py-2">{t.category || '-'}</td>
                            <td className="px-4 py-2 text-red-600">{t.type === 'debit' && t.amount ? Number(t.amount).toFixed(2) : '-'}</td>
                            <td className="px-4 py-2 text-green-600">{t.type === 'credit' && t.amount ? Number(t.amount).toFixed(2) : '-'}</td>
                            <td className="px-4 py-2">{t.balance !== undefined && t.balance !== null ? Number(t.balance).toFixed(2) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">No transactions found.</div>
            )}
            {/* Export Options */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Export Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-1">PDF Report</h3>
                  <p className="text-sm text-gray-500 mb-3">Detailed financial report with charts</p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                    onClick={exportPDF}
                  >
                    Download PDF
                  </button>
                </div>
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-1">CSV Data</h3>
                  <p className="text-sm text-gray-500 mb-3">Raw transaction data for analysis</p>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                    onClick={exportCSV}
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;