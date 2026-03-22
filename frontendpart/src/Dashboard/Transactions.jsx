import { useState, useEffect } from 'react';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', amount: '', type: 'debit', category: 'Other' });
  const [addingTx, setAddingTx] = useState(false);
  const itemsPerPage = 10;

  const loadTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(categoryFilter !== 'All Categories' && { category: categoryFilter })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setTotalTransactions(data.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
      } else {
        setError(data.message || 'Failed to load transactions');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage, categoryFilter]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setAddingTx(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: newTx.description,
          amount: parseFloat(newTx.amount),
          type: newTx.type,
          category: newTx.category,
          date: new Date().toISOString()
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddForm(false);
        setNewTx({ description: '', amount: '', type: 'debit', category: 'Other' });
        loadTransactions(currentPage);
      } else {
        setError(data.message || 'Failed to add transaction');
      }
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setAddingTx(false);
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-[#555] mt-1">{totalTransactions} total records</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-accent px-5 py-2.5 rounded-xl text-[13px]"
        >
          <i className="fas fa-plus text-xs"></i>
          {showAddForm ? 'CANCEL' : 'ADD TRANSACTION'}
        </button>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <form onSubmit={handleAddTransaction} className="cashmate-card animate-slide-down">
          <h3 className="text-sm font-bold text-white mb-4">New Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Description"
              required
              className="input-field"
              value={newTx.description}
              onChange={(e) => setNewTx({...newTx, description: e.target.value})}
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              required
              min="1"
              className="input-field"
              value={newTx.amount}
              onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
            />
            <select
              className="input-field cursor-pointer"
              value={newTx.type}
              onChange={(e) => setNewTx({...newTx, type: e.target.value})}
            >
              <option value="debit">Expense (Debit)</option>
              <option value="credit">Income (Credit)</option>
            </select>
            <button
              type="submit"
              disabled={addingTx}
              className="btn-primary justify-center rounded-xl disabled:opacity-50"
            >
              {addingTx ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="cashmate-card">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#333] text-sm"></i>
            <input
              type="text"
              placeholder="Search transactions..."
              className="input-field pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input-field w-auto min-w-[180px] cursor-pointer"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option>All Categories</option>
            <option>Food & Dining</option>
            <option>Transportation</option>
            <option>Income</option>
            <option>Entertainment</option>
            <option>Utilities</option>
            <option>Housing</option>
            <option>Shopping</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4 animate-fade-in">
            <i className="fas fa-exclamation-circle text-red-400 text-sm"></i>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 skeleton rounded-xl"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1.5">
              <thead>
                <tr className="text-[10px] font-bold text-[#444] tracking-widest uppercase">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr key={index} className="group">
                    <td className="bg-white/[0.02] px-4 py-3.5 rounded-l-xl text-xs font-medium text-[#555]">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="bg-white/[0.02] px-4 py-3.5 text-sm font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors">
                      {tx.description}
                    </td>
                    <td className="bg-white/[0.02] px-4 py-3.5">
                      <span className="badge badge-neutral text-[9px]">
                        {tx.category || 'General'}
                      </span>
                    </td>
                    <td className="bg-white/[0.02] px-4 py-3.5 rounded-r-xl text-right">
                      <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-[var(--accent-secondary)]' : 'text-white'}`}>
                        {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && !loading && (
              <div className="text-center py-16">
                <i className="fas fa-receipt text-3xl text-[#222] mb-3 block"></i>
                <p className="text-sm text-[#444]">No transactions found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/[0.04]">
          <p className="text-xs text-[#444] font-medium">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.06] text-[#555] hover:text-white disabled:opacity-20 transition-all"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.06] text-[#555] hover:text-white disabled:opacity-20 transition-all"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;