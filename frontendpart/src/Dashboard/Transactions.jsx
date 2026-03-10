import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from '../components/Footer';
import { getTransactions, addTransaction } from '../api';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const itemsPerPage = 10;

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

  // Load transactions from API
  const loadTransactions = async (page = 1) => {
    try {
      setLoading(true);
      
      // Fetch transactions from the transactions endpoint (user-filtered)
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(categoryFilter !== 'All Categories' && { category: categoryFilter })
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
        
        const data = await response.json();
        
        if (data.success) {
          // Transform the data to match the expected format
          const formattedTransactions = (data.transactions || []).map(tx => ({
            id: tx._id,
            desc: tx.description,
            date: new Date(tx.date).toLocaleDateString(),
            category: tx.category || getCategoryFromDescription(tx.description),
            amount: tx.amount,
            type: tx.type // 'debit' or 'credit'
          }));
          
          setTransactions(formattedTransactions);
          setTotalTransactions(data.total || 0);
          setTotalPages(data.pagination?.totalPages || 1);
          setCurrentPage(data.pagination?.currentPage || 1);
          
          if (formattedTransactions.length === 0 && page === 1) {
            setError('No transactions found. Upload a bank statement to get started!');
          } else {
            setError('');
          }
        } else {
          setError(data.message || 'Failed to load transactions');
          setTransactions([]);
        }
    } catch (err) {
      console.error('Transactions loading error:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Please log in to view your transactions');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else {
        setError('Failed to load transactions. Please try again later.');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage, categoryFilter]);

  const categoryColors = {
    "Food & Dining": "bg-green-100 text-green-800",
    "Transportation": "bg-blue-100 text-blue-800",
    "Income": "bg-green-100 text-green-800",
    "Entertainment": "bg-purple-100 text-purple-800",
    "Utilities": "bg-yellow-100 text-yellow-800",
    "Housing": "bg-pink-100 text-pink-800",
    "Shopping": "bg-blue-100 text-blue-800",
    "Cash": "bg-gray-100 text-gray-800",
    "Credit Card": "bg-red-100 text-red-800",
    "Other": "bg-gray-100 text-gray-800",
  };

  const getIndicatorColor = (category) => {
    const colorClass = categoryColors[category] || "bg-gray-100 text-gray-800";
    return colorClass.includes("green") ? "bg-green-500" :
           colorClass.includes("blue") ? "bg-blue-500" :
           colorClass.includes("purple") ? "bg-purple-500" :
           colorClass.includes("yellow") ? "bg-yellow-500" :
           colorClass.includes("pink") ? "bg-pink-500" :
           colorClass.includes("red") ? "bg-red-500" :
           "bg-gray-500";
  };

  const handleAddTransaction = async () => {
    try {
      if (!description || !date || !category || !amount) {
        setError('Please fill in all fields');
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          date,
          category,
          amount: parseFloat(amount),
          type: parseFloat(amount) > 0 ? 'credit' : 'debit'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Reload transactions to show the new one
        window.location.reload();
      } else {
        setError(data.message || 'Failed to add transaction');
      }
    } catch (err) {
      console.error('Add transaction error:', err);
      setError('Failed to add transaction');
    }
    
    setIsModalOpen(false);
    setDescription('');
    setDate('');
    setCategory('');
    setAmount('');
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-gray-50 font-inter">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
              <p className="text-gray-600 text-sm mt-1">Manage and track all your financial transactions</p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Add Transaction
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search transactions..."
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="sm:w-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All Categories</option>
              <option>Food & Dining</option>
              <option>Transportation</option>
              <option>Income</option>
              <option>Entertainment</option>
              <option>Utilities</option>
              <option>Housing</option>
              <option>Shopping</option>
              <option>Cash</option>
              <option>Credit Card</option>
              <option>Other</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No transactions found.</p>
              <p className="text-sm text-gray-500">Upload a bank statement or add transactions manually to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((tx, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 text-sm">{tx.date}</td>
                      <td className="px-4 py-2 text-sm flex items-center">
                        <span className={`w-2 h-2 ${getIndicatorColor(tx.category)} rounded-full mr-2`}></span>
                        {tx.desc}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 ${categoryColors[tx.category] || "bg-gray-100 text-gray-800"} rounded`}>{tx.category}</span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPage <= 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPage >= totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <div
          id="addTransactionModal"
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${isModalOpen ? '' : 'hidden'}`}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
            <div className="space-y-4">
              <input
                id="desc"
                type="text"
                placeholder="Description"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                id="date"
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                id="category"
                type="text"
                placeholder="Category"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                id="amount"
                type="number"
                placeholder="Amount (₹)"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
              onClick={handleAddTransaction}
            >
              Add Transaction
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transactions;