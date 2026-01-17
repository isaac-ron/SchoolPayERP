import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import dashboardService from '../../services/dashboardService';
import { SocketContext } from '../../context/SocketContext';
import { 
  mockDashboardStats, 
  mockRecentTransactions, 
  mockCollectionTrends, 
  mockPaymentMethods,
  mockStudentAvatars 
} from '../../utils/mockData';

const Dashboard = () => {
  const { socket } = useContext(SocketContext);
  const [stats, setStats] = useState(mockDashboardStats);
  const [transactions, setTransactions] = useState(mockRecentTransactions.slice(0, 5));
  const [trends, setTrends] = useState(mockCollectionTrends);
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveUpdate, setLiveUpdate] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up Socket.io listeners for real-time updates
    if (socket) {
      console.log('Setting up socket listeners for dashboard');
      
      socket.on('payment_received', (paymentData) => {
        console.log('🔴 LIVE: Payment received!', paymentData);
        
        // Show live update notification
        setLiveUpdate({
          type: 'success',
          message: `${paymentData.source} payment of KES ${paymentData.amount.toLocaleString()} received from ${paymentData.studentName}`,
          time: Date.now()
        });
        
        // Add transaction to the top of the list
        setTransactions(prev => [paymentData, ...prev.slice(0, 4)]);
        
        // Update stats - increment today's collection
        setStats(prev => ({
          ...prev,
          totalCollectedToday: prev.totalCollectedToday + paymentData.amount
        }));
        
        // Refresh full data after 3 seconds
        setTimeout(() => {
          fetchDashboardData();
          setLiveUpdate(null);
        }, 3000);
      });
      
      socket.on('unknown_payment', (paymentData) => {
        console.log('⚠️ LIVE: Unknown payment received!', paymentData);
        
        setLiveUpdate({
          type: 'warning',
          message: `Suspense: KES ${paymentData.amount.toLocaleString()} received for unknown student (Ref: ${paymentData.reference})`,
          time: Date.now()
        });
        
        setTimeout(() => {
          setLiveUpdate(null);
        }, 5000);
      });
      
      return () => {
        socket.off('payment_received');
        socket.off('unknown_payment');
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data from API...');
      
      // Try to fetch real data from API
      const [statsData, transactionsData, trendsData, paymentData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentTransactions(5),
        dashboardService.getCollectionTrends(30),
        dashboardService.getPaymentMethodsBreakdown()
      ]);

      console.log('✅ Dashboard data loaded:', {
        stats: statsData,
        transactionCount: transactionsData.length
      });
      
      setStats(statsData);
      setTransactions(transactionsData);
      setTrends(trendsData);
      setPaymentMethods(paymentData);
      setError(null);
    } catch (error) {
      console.log('⚠️ API not available, using mock data', error);
      // Continue using mock data if API fails
      setError('Using mock data - API not connected');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('KES', 'KES ');
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-surface-border bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <button className="lg:hidden text-text-main">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="text-text-main text-2xl font-bold leading-tight tracking-tight font-display">Overview</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center w-72 h-11 bg-slate-50 border border-surface-border rounded-full overflow-hidden group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <div className="pl-4 pr-2 text-text-muted flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none text-text-main text-sm placeholder:text-text-muted focus:ring-0 focus:outline-none h-full" 
              placeholder="Search student or adm no..."
            />
          </div>
          <button className="flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-blue-900 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-900/10">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">Record Payment</span>
          </button>
          <button className="size-11 flex items-center justify-center rounded-full bg-white border border-surface-border text-text-muted hover:text-primary hover:bg-slate-50 transition-all relative shadow-sm">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-3 size-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50">
        {/* Live Update Notification */}
        {liveUpdate && (
          <div className={`${
            liveUpdate.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-orange-50 border-orange-500 text-orange-800'
          } border-l-4 rounded-lg p-4 flex items-center gap-3 animate-slide-in shadow-lg`}>
            <div className="flex items-center justify-center size-10 rounded-full bg-white shadow-sm">
              <span className={`material-symbols-outlined ${liveUpdate.type === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                {liveUpdate.type === 'success' ? 'check_circle' : 'info'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">LIVE UPDATE</p>
              <p className="text-sm font-medium">{liveUpdate.message}</p>
            </div>
            <span className="text-xs font-mono opacity-50">just now</span>
          </div>
        )}
        
        {/* Error Banner */}
        {error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <span className="text-blue-800 text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Total Collected Today */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <span className="material-symbols-outlined text-8xl text-primary">payments</span>
                </div>
                <div className="flex flex-col gap-2 z-10">
                  <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">Total Collected Today</p>
                  <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">
                    {formatCurrency(stats.totalCollectedToday)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-5 z-10">
                  <div className="bg-success/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-success text-sm">
                      {stats.totalCollectedTodayChange >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    <p className={`text-sm font-bold ${stats.totalCollectedTodayChange >= 0 ? 'text-success' : 'text-red-600'}`}>
                      {stats.totalCollectedTodayChange >= 0 ? '+' : ''}{stats.totalCollectedTodayChange}%
                    </p>
                  </div>
                  <p className="text-text-muted text-xs font-medium">vs yesterday</p>
                </div>
              </div>

              {/* Outstanding Balance */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="absolute -top-2 -right-2 p-4 opacity-[0.03]">
                  <span className="material-symbols-outlined text-8xl text-primary">account_balance_wallet</span>
                </div>
                <div className="flex flex-col gap-2 z-10">
                  <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">Outstanding Balance</p>
                  <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">
                    {formatCurrency(stats.outstandingBalance)}
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-6">
                  <div 
                    className="bg-orange-500 h-2 rounded-full shadow-sm" 
                    style={{width: `${stats.outstandingPercentage}%`}}
                  ></div>
                </div>
                <p className="text-text-muted text-xs mt-2 font-medium">
                  {stats.outstandingPercentage}% pending collection
                </p>
              </div>

              {/* Active Students */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="absolute -top-2 -right-2 p-4 opacity-[0.03]">
                  <span className="material-symbols-outlined text-8xl text-primary">groups</span>
                </div>
                <div className="flex flex-col gap-2 z-10">
                  <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">Active Students</p>
                  <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">
                    {formatNumber(stats.activeStudents)}
                  </p>
                </div>
                <div className="mt-5 flex -space-x-3">
                  {mockStudentAvatars.map((avatar, index) => (
                    <div 
                      key={index}
                      className="size-9 rounded-full bg-slate-200 border-2 border-white shadow-sm bg-cover bg-center" 
                      style={{backgroundImage: `url("${avatar}")`}}
                    ></div>
                  ))}
                  <div className="size-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-text-muted font-bold shadow-sm">
                    +{stats.activeStudents - 3}
                  </div>
                </div>
              </div>

              {/* SMS Sent */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="absolute -top-2 -right-2 p-4 opacity-[0.03]">
                  <span className="material-symbols-outlined text-8xl text-primary">sms</span>
                </div>
                <div className="flex flex-col gap-2 z-10">
                  <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">SMS Sent</p>
                  <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">
                    {formatNumber(stats.smsSent)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-5 z-10">
                  <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                  <p className="text-text-muted text-xs font-medium">
                    {stats.systemStatus === 'operational' ? 'All systems operational' : 'System issues detected'}
                  </p>
                </div>
              </div>
            </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Collection Trends Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-border bg-white p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-text-main text-xl font-bold font-display">Fee Collection Trends</h3>
                <p className="text-text-muted text-sm mt-1">Last 30 Days</p>
              </div>
              <div className="text-right">
                <p className="text-primary text-2xl font-bold tracking-tight font-display">
                  {formatCurrency(trends.totalRevenue)}
                </p>
                <p className="text-text-muted text-xs uppercase tracking-wider font-bold">Revenue</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[250px] relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#1e3a8a', stopOpacity:0.1}} />
                    <stop offset="100%" style={{stopColor:'#1e3a8a', stopOpacity:0}} />
                  </linearGradient>
                </defs>
                <line stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" x1="0" y1="150" x2="800" y2="150" />
                <line stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" x1="0" y1="100" x2="800" y2="100" />
                <line stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" x1="0" y1="50" x2="800" y2="50" />
                <path d="M0,150 C100,150 150,80 200,80 C250,80 300,120 400,100 C500,80 550,20 650,40 C720,54 750,10 800,30 V200 H0 Z" fill="url(#gradient)" />
                <path d="M0,150 C100,150 150,80 200,80 C250,80 300,120 400,100 C500,80 550,20 650,40 C720,54 750,10 800,30" fill="none" stroke="#1e3a8a" strokeLinecap="round" strokeWidth="3" />
                <circle cx="200" cy="80" r="5" fill="white" stroke="#1e3a8a" strokeWidth="2" />
                <circle cx="400" cy="100" r="5" fill="white" stroke="#1e3a8a" strokeWidth="2" />
                <circle className="animate-pulse" cx="650" cy="40" r="6" fill="#1e3a8a" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-text-muted text-xs font-bold mt-4 uppercase tracking-wide border-t border-slate-100 pt-4">
              {trends.weeks.map((week, index) => (
                <span key={index}>{week.label}</span>
              ))}
            </div>
          </div>

          {/* Payment Methods Chart */}
          <div className="rounded-2xl border border-surface-border bg-white p-6 flex flex-col shadow-sm">
            <h3 className="text-text-main text-xl font-bold font-display mb-1">Payment Methods</h3>
            <p className="text-text-muted text-sm mb-6">MPESA vs Bank</p>
            <div className="flex-1 flex items-center justify-center relative my-4">
              <div 
                className="size-56 rounded-full relative" 
                style={{background: `conic-gradient(#1e3a8a 0% ${paymentMethods.mpesa.percentage}%, #94a3b8 ${paymentMethods.mpesa.percentage}% 100%)`}}
              >
                <div className="absolute inset-8 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="text-4xl font-extrabold text-text-main font-display">
                    {paymentMethods.mpesa.percentage}%
                  </span>
                  <span className="text-xs text-text-muted font-bold tracking-wider uppercase mt-1">MPESA</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-primary"></span>
                <div className="flex flex-col">
                  <span className="text-sm text-text-main font-semibold">MPESA</span>
                  <span className="text-xs text-text-muted">{formatCurrency(paymentMethods.mpesa.amount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-slate-400"></span>
                <div className="flex flex-col">
                  <span className="text-sm text-text-main font-semibold">Bank</span>
                  <span className="text-xs text-text-muted">{formatCurrency(paymentMethods.bank.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Transactions Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-text-main text-xl font-bold tracking-tight font-display">Live Transactions Feed</h3>
            <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="rounded-2xl border border-surface-border bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-surface-border text-text-muted text-xs uppercase tracking-wider font-bold">
                    <th className="p-5 pl-8 font-semibold">Transaction ID</th>
                    <th className="p-5 font-semibold">Student Name</th>
                    <th className="p-5 font-semibold">Amount</th>
                    <th className="p-5 font-semibold">Source</th>
                    <th className="p-5 pr-8 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-surface-border">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-5 pl-8 text-text-main font-mono text-xs font-medium">#{transaction.id}</td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-text-main font-bold">{transaction.studentName}</span>
                          <span className="text-text-muted text-xs">Adm: {transaction.admissionNumber}</span>
                        </div>
                      </td>
                      <td className="p-5 text-success font-extrabold text-base">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                          transaction.source === 'MPESA' 
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {transaction.source}
                        </span>
                      </td>
                      <td className="p-5 pr-8 text-text-muted text-right font-medium">{transaction.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>
        )}

        <div className="h-8"></div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;

