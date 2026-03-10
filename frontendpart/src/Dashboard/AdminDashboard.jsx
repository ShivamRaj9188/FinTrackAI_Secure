import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  createUser,
  updateUser,
  getUserGrowthData,
  sendNotification,
  toggleMaintenanceMode,
  getContactMessages,
  getContactStats,
  updateContactMessage,
  sendContactResponse,
  deleteContactMessage
} from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState('');
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: '',
    plan: ''
  });

  // Contact management state
  const [contacts, setContacts] = useState([]);
  const [contactStats, setContactStats] = useState({
    statusStats: [],
    departmentStats: [],
    recentContacts: [],
    totalContacts: 0
  });
  const [contactFilters, setContactFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    department: '',
    priority: '',
    search: ''
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load system stats
        const statsResult = await getAdminStats();
        if (statsResult.success) {
          setSystemStats(statsResult.data);
        }

        // Load users
        const usersResult = await getAllUsers(userPage, 10, searchTerm);
        if (usersResult.success) {
          setUsers(usersResult.data.users);
        }

        // Load maintenance status
        try {
          const maintenanceResult = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/maintenance/status`);
          const maintenanceData = await maintenanceResult.json();
          if (maintenanceData.success) {
            setMaintenanceMode(maintenanceData.data.maintenanceMode);
          }
        } catch (err) {
          console.warn('Failed to load maintenance status:', err);
        }

      }  finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userPage, searchTerm]);

  // Load user growth data
  const loadUserGrowthData = useCallback(async (period = 'monthly') => {
    try {
      const result = await getUserGrowthData(period);
      if (result.success) {
        setUserGrowthData(result.data);
      } else {
        console.warn('Failed to load user growth data:', result.message);
        setUserGrowthData(null);
      }
    } catch (error) {
      console.warn('Error loading user growth data:', error.message);
      setUserGrowthData(null);
    }
  }, []);

  // Load user growth data when component mounts or period changes
  useEffect(() => {
    loadUserGrowthData(chartPeriod);
  }, [chartPeriod, loadUserGrowthData]);

  // Load contact data when contacts tab is active
  const loadContactData = useCallback(async () => {
    try {
      setLoading(true);
      const [contactsResult, statsResult] = await Promise.all([
        getContactMessages(contactFilters),
        getContactStats()
      ]);
      
      setContacts(contactsResult.data || []);
      setContactStats(statsResult.data || {
        statusStats: [],
        departmentStats: [],
        recentContacts: [],
        totalContacts: 0
      });
    } catch (err) {
      console.error('Error loading contact data:', err);
      setError('Failed to load contact data');
    } finally {
      setLoading(false);
    }
  }, [contactFilters]);

  useEffect(() => {
    if (activeTab === 'contacts') {
      loadContactData();
    }
  }, [activeTab, loadContactData]);

  // Initialize chart
  useEffect(() => {
    const initializeChart = async () => {
      try {
        setChartLoading(true);
        setChartError('');
        
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        setTimeout(() => {
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }

          if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            
            // Use user growth data if available, otherwise show empty chart
            const chartData = userGrowthData || {
              labels: ['No Data'],
              data: [0]
            };

            chartInstance.current = new Chart(ctx, {
              type: 'line',
              data: {
                labels: chartData.labels,
                datasets: [{
                  label: 'Users',
                  data: chartData.data,
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  borderColor: 'rgba(59,130,246,1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: 'rgba(59,130,246,1)',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index'
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(148,163,184,0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'rgba(71,85,105,0.8)',
                      font: {
                        size: 12
                      }
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(148,163,184,0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'rgba(71,85,105,0.8)',
                      font: {
                        size: 12
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(59,130,246,1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart'
                }
              }
            });
            
            setChartLoading(false);
          }
        }, 100);
      } catch (error) {
        console.error('Error loading Chart.js:', error);
        setChartError('Failed to load chart');
        setChartLoading(false);
      }
    };

    // Always initialize chart, with or without user growth data
    initializeChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [userGrowthData]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/admin');
  };

  const handleUserStatusToggle = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      
      const result = await updateUserStatus(userId, newStatus);
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        ));
        setSuccessMessage(`User status updated to ${newStatus}`);
      } else {
        setError(result.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('User status toggle error:', err);
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          setUsers(users.filter(user => user.id !== userId));
          setSuccessMessage('User deleted successfully');
        } else {
          setError(result.message || 'Failed to delete user');
        }
      } catch (err) {
        console.error('User deletion error:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleSearchUsers = async (searchValue) => {
    setSearchTerm(searchValue);
    setUserPage(1); // Reset to first page when searching
  };

  const handleAddUser = async () => {
    try {
      if (!newUserData.name || !newUserData.email || !newUserData.password) {
        setError('Name, email, and password are required');
        return;
      }

      const result = await createUser(newUserData);
      if (result.success) {
        // Add new user to the list
        setUsers([result.data, ...users]);
        setSuccessMessage('User created successfully');
        setShowAddUserModal(false);
        setNewUserData({ name: '', email: '', password: '', phone: '', location: '' });
        
        // Reload users to get fresh data from database
        setTimeout(async () => {
          try {
            const usersResult = await getAllUsers(userPage, 10, searchTerm);
            if (usersResult.success) {
              setUsers(usersResult.data.users);
            }
          } catch (err) {
            console.error('Error reloading users:', err);
          }
        }, 500);
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('User creation error:', err);
      setError('Failed to create user');
    }
  };

  const handleModalInputChange = (field, value) => {
    setNewUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditModalInputChange = (field, value) => {
    setEditUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      role: user.role || 'user',
      plan: user.plan || 'Basic'
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!editUserData.name || !editUserData.email) {
        setError('Name and email are required');
        return;
      }

      const result = await updateUser(editingUser.id, editUserData);
      if (result.success) {
        // Update user in the list
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...editUserData }
            : user
        ));
        setSuccessMessage('User updated successfully');
        setShowEditUserModal(false);
        setEditingUser(null);
        setEditUserData({ name: '', email: '', phone: '', location: '', role: '', plan: '' });
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('User update error:', err);
      setError('Failed to update user');
    }
  };

  const handleSendNotification = async () => {
    const title = prompt('Enter notification title:');
    if (!title || title.trim() === '') {
      setError('Notification title is required');
      return;
    }
    
    const message = prompt('Enter notification message:');
    if (!message || message.trim() === '') {
      setError('Notification message is required');
      return;
    }
    
    try {
      const result = await sendNotification({ 
        title: title.trim(), 
        message: message.trim(), 
        type: 'info' 
      });
      
      if (result.success) {
        setSuccessMessage('Notification sent successfully to all users');
      } else {
        setError(result.message || 'Failed to send notification');
      }
    } catch (err) {
      console.error('Notification error:', err);
      setError('Failed to send notification. Please try again.');
    }
  };

  const handleToggleMaintenance = async () => {
    const currentMode = maintenanceMode;
    const action = currentMode ? 'disable' : 'enable';
    
    const confirmed = window.confirm(
      `Are you sure you want to ${action} maintenance mode? ${
        !currentMode 
          ? 'This will make the site unavailable to regular users.' 
          : 'This will make the site available to all users again.'
      }`
    );
    
    if (!confirmed) return;
    
    try {
      const result = await toggleMaintenanceMode(!currentMode);
      if (result.success) {
        setMaintenanceMode(!currentMode);
        setSuccessMessage(
          `Maintenance mode ${!currentMode ? 'enabled' : 'disabled'} successfully`
        );
      } else {
        setError(result.message || 'Failed to toggle maintenance mode');
      }
    } catch (err) {
      console.error('Maintenance toggle error:', err);
      setError('Failed to toggle maintenance mode. Please try again.');
    }
  };

  // Contact management handlers
  const handleContactStatusUpdate = async (contactId, newStatus) => {
    try {
      const result = await updateContactMessage(contactId, { status: newStatus });
      if (result.success) {
        setSuccessMessage('Contact status updated successfully');
        loadContactData(); // Reload data
      } else {
        setError(result.message || 'Failed to update contact status');
      }
    } catch (err) {
      console.error('Contact status update error:', err);
      setError('Failed to update contact status');
    }
  };

  const handleSendContactResponse = async (contactId) => {
    if (!responseMessage.trim()) {
      setError('Please enter a response message');
      return;
    }

    try {
      const result = await sendContactResponse(contactId, responseMessage);
      if (result.success) {
        setSuccessMessage('Response sent successfully');
        setResponseMessage('');
        setShowContactModal(false);
        setSelectedContact(null);
        loadContactData(); // Reload data
      } else {
        setError(result.message || 'Failed to send response');
      }
    } catch (err) {
      console.error('Send response error:', err);
      setError('Failed to send response');
    }
  };

  const handleDeleteContact = async (contactId) => {
    const confirmed = window.confirm('Are you sure you want to delete this contact message?');
    if (!confirmed) return;

    try {
      const result = await deleteContactMessage(contactId);
      if (result.success) {
        setSuccessMessage('Contact message deleted successfully');
        loadContactData(); // Reload data
      } else {
        setError(result.message || 'Failed to delete contact message');
      }
    } catch (err) {
      console.error('Delete contact error:', err);
      setError('Failed to delete contact message');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setContactFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const openContactModal = (contact) => {
    setSelectedContact(contact);
    setResponseMessage(contact.adminResponse || '');
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedContact(null);
    setResponseMessage('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const StatCard = ({ title, value, icon, change, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change !== undefined && change !== null && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <i className={`fas ${change > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <i className={`fas ${icon} text-${color}-600 text-xl`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-slate-900">FinTrackAI Admin</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <i className="fas fa-user-shield"></i>
                <span className="text-sm">Admin Panel</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-chart-pie mr-2"></i>
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              User Management
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <i className="fas fa-envelope mr-2"></i>
              Contact Messages
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
              <span className="text-red-800">{error}</span>
              <button 
                onClick={clearMessages}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-600 mr-2"></i>
              <span className="text-green-800">{successMessage}</span>
              <button 
                onClick={clearMessages}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={systemStats.totalUsers.toLocaleString()}
                icon="fa-users"
                change={systemStats.totalUsersGrowth || systemStats.monthlyGrowth || 0}
                color="blue"
              />
              <StatCard
                title="Active Users"
                value={systemStats.activeUsers.toLocaleString()}
                icon="fa-user-check"
                change={systemStats.activeUsersGrowth}
                color="green"
              />
              <StatCard
                title="Premium Revenue"
                value={`₹${systemStats.totalRevenue?.toLocaleString() || '0'}`}
                icon="fa-rupee-sign"
                change={systemStats.revenueGrowth}
                color="purple"
              />
            </div>

            {/* User Growth Chart - Full Width and Centered */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">User Growth Analytics</h3>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Period:</label>
                    <select
                      value={chartPeriod}
                      onChange={(e) => setChartPeriod(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Last 30 Days</option>
                      <option value="weekly">Last 12 Weeks</option>
                      <option value="monthly">Last 12 Months</option>
                    </select>
                  </div>
                </div>
                <div className="w-full max-w-4xl mx-auto">
                  <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 relative border border-gray-200">
                    {chartLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600 font-medium">Loading chart...</p>
                        </div>
                      </div>
                    )}
                    {chartError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
                        <div className="text-center">
                          <div className="text-red-500 text-4xl mb-4">📊</div>
                          <p className="text-gray-600 font-medium">{chartError}</p>
                          <p className="text-gray-500 text-sm mt-2">Please refresh the page</p>
                        </div>
                      </div>
                    )}
                    <canvas ref={chartRef} className="w-full h-full"></canvas>
                  </div>
                  
                  {/* Chart Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userGrowthData?.data?.length > 0 ? userGrowthData.data[userGrowthData.data.length - 1] : 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        {chartPeriod === 'daily' ? 'Yesterday' : 
                         chartPeriod === 'weekly' ? 'Last Week' : 
                         'Last Month'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userGrowthData?.data?.length > 1 ? 
                          (() => {
                            const current = userGrowthData.data[userGrowthData.data.length - 1];
                            const previous = userGrowthData.data[userGrowthData.data.length - 2];
                            const growth = previous > 0 ? ((current - previous) / previous * 100) : 0;
                            return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
                          })() : 
                          '0%'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Growth Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{systemStats.totalUsers}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <i className="fas fa-user-plus text-blue-600 text-xl mb-2"></i>
                  <span className="text-sm text-blue-600 font-medium">Add User</span>
                </button>

                <button 
                  onClick={handleToggleMaintenance}
                  className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <i className="fas fa-tools text-red-600 text-xl mb-2"></i>
                  <span className="text-sm text-red-600 font-medium">
                    {maintenanceMode ? 'Disable' : 'Enable'} Maintenance
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{successMessage}</span>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <span className="sr-only">Close</span>
                  <span className="text-green-500">&times;</span>
                </button>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <span className="sr-only">Close</span>
                  <span className="text-red-500">&times;</span>
                </button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Add New User
              </button>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900">All Users</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-2 text-slate-400 hover:text-slate-600">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.plan === 'Enterprise' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : user.plan === 'Premium'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.plan || 'Basic'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.joinDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Contact Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Total Messages</h3>
                    <p className="text-3xl font-bold">{contactStats.totalContacts}</p>
                  </div>
                  <i className="fas fa-envelope text-3xl opacity-80"></i>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Resolved</h3>
                    <p className="text-3xl font-bold">
                      {contactStats.statusStats?.find(s => s._id === 'resolved')?.count || 0}
                    </p>
                  </div>
                  <i className="fas fa-check-circle text-3xl opacity-80"></i>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Pending</h3>
                    <p className="text-3xl font-bold">
                      {(contactStats.statusStats?.find(s => s._id === 'new')?.count || 0) + 
                       (contactStats.statusStats?.find(s => s._id === 'in-progress')?.count || 0)}
                    </p>
                  </div>
                  <i className="fas fa-clock text-3xl opacity-80"></i>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">This Month</h3>
                    <p className="text-3xl font-bold">
                      {contacts.filter(c => {
                        const contactDate = new Date(c.createdAt);
                        const now = new Date();
                        return contactDate.getMonth() === now.getMonth() && 
                               contactDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <i className="fas fa-calendar text-3xl opacity-80"></i>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Filter Messages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={contactFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={contactFilters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    <option value="Support">Support</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Careers">Careers</option>
                    <option value="Sales">Sales</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={contactFilters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={contactFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search name, email, message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Messages Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Contact Messages</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {contact.department || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={contact.status}
                            onChange={(e) => handleContactStatusUpdate(contact._id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}
                          >
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                            {contact.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openContactModal(contact)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View & Respond"
                            >
                              <i className="fas fa-reply"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Message"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {contacts.length === 0 && (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-gray-400 text-6xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contact messages</h3>
                    <p className="text-gray-500">No contact messages found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => handleModalInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => handleModalInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => handleModalInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => handleModalInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newUserData.location}
                  onChange={(e) => handleModalInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => handleEditModalInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => handleEditModalInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editUserData.phone}
                  onChange={(e) => handleEditModalInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editUserData.location}
                  onChange={(e) => handleEditModalInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editUserData.role}
                  onChange={(e) => handleEditModalInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={editUserData.plan}
                  onChange={(e) => handleEditModalInputChange('plan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                  setEditUserData({ name: '', email: '', phone: '', location: '', role: '', plan: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Response Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Message Details</h3>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            {/* Contact Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{selectedContact.firstName} {selectedContact.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-gray-900">{selectedContact.department || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-gray-900">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Original Message */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Original Message</p>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
            </div>

            {/* Previous Response (if any) */}
            {selectedContact.adminResponse && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Previous Response</p>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.adminResponse}</p>
                  {selectedContact.respondedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responded by {selectedContact.respondedBy} on {new Date(selectedContact.respondedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Response Form */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Response Email
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type your response here..."
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeContactModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendContactResponse(selectedContact._id)}
                disabled={!responseMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
