import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, MenuItem } from '../types';
import { DEFAULT_ADMIN_CREDENTIALS } from '../data/adminCredentials';
import { AdminLoginModal } from './AdminLoginModal';
import { 
  TrendingUp, 
    RotateCcw,
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Receipt, 
  Plus, 
  Minus, 
  Edit3, 
  Download, 
  ChefHat,
  Flame,
  Coffee,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  UtensilsCrossed,
  Banknote,
  QrCode,
  Lock,
  ShieldCheck,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  ShieldAlert,
  Save,
  Check,
  FileCode
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    menuItems, 
    updateItemStock, 
    updateOrderStatus, 
    updatePaymentStatus,
    addMenuItem, 
    setActiveReceiptOrder,
    switchUserRole,
    setActiveTab,
    currentUser,
    loginAsAdmin,
    logout,
    adminCredentials,
    updateAdminCredentials,
    resetAdminCredentialsState,
    t,
    getItemName 
  } = useApp();

  // Admin Security Login State
  const [authEmail, setAuthEmail] = useState(adminCredentials.username);
  const [authPassword, setAuthPassword] = useState(adminCredentials.password);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredPassword, setShowCredPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Admin Credentials Modification State
  const [credUsername, setCredUsername] = useState(adminCredentials.username);
  const [credDisplayName, setCredDisplayName] = useState(adminCredentials.displayName);
  const [credPassword, setCredPassword] = useState(adminCredentials.password);
  const [credConfirmPass, setCredConfirmPass] = useState(adminCredentials.password);
  const [credSuccessMsg, setCredSuccessMsg] = useState('');
  const [credErrorMsg, setCredErrorMsg] = useState('');

  // Sync state if credentials change
  useEffect(() => {
    setCredUsername(adminCredentials.username);
    setCredDisplayName(adminCredentials.displayName);
    setCredPassword(adminCredentials.password);
    setCredConfirmPass(adminCredentials.password);
    setAuthEmail(adminCredentials.username);
    setAuthPassword(adminCredentials.password);
  }, [adminCredentials]);

  const [adminTab, setAdminTab] = useState<'transactions' | 'kitchen' | 'inventory' | 'analytics' | 'security'>('transactions');
  const sixMonthsAgo = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }, []);
  const recentOrders = useMemo(
    () => orders.filter(order => new Date(order.createdAt) >= sixMonthsAgo),
    [orders, sixMonthsAgo]
  );
  
  // Transaction filter states
  const [txnSearch, setTxnSearch] = useState('');
  const [txnStatusFilter, setTxnStatusFilter] = useState<string>('all');
  const [txnMethodFilter, setTxnMethodFilter] = useState<string>('all');

  // Inventory filter states
  const [invSearch, setInvSearch] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>('all');
  const [showAddDishModal, setShowAddDishModal] = useState(false);

  // New Dish Form State
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<MenuItem['category']>('maggie');
  const [newDishPrice, setNewDishPrice] = useState<number>(75);
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishStock, setNewDishStock] = useState<number>(20);
  const [newDishVeg, setNewDishVeg] = useState(true);

  // Calculated Analytics KPIs
  const analytics = useMemo(() => {
    const totalOrdersCount = recentOrders.length;
    const paidOrders = recentOrders.filter(o => o.payment.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.payment.total, 0);
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    
    // Low stock items count (< 10)
    const lowStockCount = menuItems.filter(i => i.stock < 10 && i.stock > 0).length;
    const outOfStockCount = menuItems.filter(i => i.stock === 0).length;

    // Category Sales breakdown
    const categoryTotals: Record<string, { count: number; amount: number }> = {};
    recentOrders.forEach(order => {
      order.items.forEach(ci => {
        const cat = ci.item.category;
        if (!categoryTotals[cat]) categoryTotals[cat] = { count: 0, amount: 0 };
        categoryTotals[cat].count += ci.quantity;
        categoryTotals[cat].amount += (ci.item.price * ci.quantity);
      });
    });

    const categoryList = Object.entries(categoryTotals).map(([cat, val]) => ({
      category: cat.replace('_', ' ').toUpperCase(),
      count: val.count,
      amount: val.amount,
      percentage: totalRevenue > 0 ? Math.round((val.amount / totalRevenue) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Top Selling Items Leaderboard
    const itemSales: Record<string, { item: MenuItem; count: number; revenue: number }> = {};
    recentOrders.forEach(order => {
      order.items.forEach(ci => {
        const id = ci.menuItemId;
        if (!itemSales[id]) {
          itemSales[id] = { item: ci.item, count: 0, revenue: 0 };
        }
        itemSales[id].count += ci.quantity;
        itemSales[id].revenue += ci.item.price * ci.quantity;
      });
    });

    const topItems = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // 7-day revenue trend simulation
    const dayTrends = [
      { day: 'Mon', revenue: Math.round(totalRevenue * 0.12) + 420, orders: 8 },
      { day: 'Tue', revenue: Math.round(totalRevenue * 0.14) + 550, orders: 11 },
      { day: 'Wed', revenue: Math.round(totalRevenue * 0.11) + 380, orders: 7 },
      { day: 'Thu', revenue: Math.round(totalRevenue * 0.15) + 610, orders: 12 },
      { day: 'Fri', revenue: Math.round(totalRevenue * 0.18) + 890, orders: 15 },
      { day: 'Sat', revenue: Math.round(totalRevenue * 0.22) + 1200, orders: 21 },
      { day: 'Sun', revenue: Math.round(totalRevenue * 0.25) + 1450, orders: 26 }
    ];

    // Peak hourly distribution
    const hourlyPeak = [
      { time: '10 AM - 12 PM', label: 'Morning Tea & Dosa', count: 18, color: 'bg-amber-400' },
      { time: '12 PM - 03 PM', label: 'Lunch Pulav & Meals', count: 34, color: 'bg-orange-500' },
      { time: '04 PM - 07 PM', label: 'Evening Maggie Rush', count: 52, color: 'bg-amber-600' },
      { time: '07 PM - 10 PM', label: 'Dinner & Late Snacks', count: 39, color: 'bg-rose-500' }
    ];

    return {
      totalRevenue,
      totalOrdersCount,
      avgOrderValue,
      lowStockCount,
      outOfStockCount,
      categoryList,
      topItems,
      dayTrends,
      hourlyPeak
    };
  }, [recentOrders, menuItems]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return recentOrders.filter(o => {
      if (txnStatusFilter !== 'all' && o.payment.status !== txnStatusFilter) return false;
      if (txnMethodFilter !== 'all' && o.payment.method !== txnMethodFilter) return false;
      if (txnSearch.trim()) {
        const q = txnSearch.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q) || o.payment.transactionId.toLowerCase().includes(q);
        const matchesCustomer = o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q);
        if (!matchesId && !matchesCustomer) return false;
      }
      return true;
    });
  }, [recentOrders, txnStatusFilter, txnMethodFilter, txnSearch]);

  // Filtered Inventory Items
  const filteredInventory = useMemo(() => {
    return menuItems.filter(item => {
      if (invCategoryFilter !== 'all' && item.category !== invCategoryFilter) return false;
      if (invSearch.trim()) {
        const q = invSearch.toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [menuItems, invCategoryFilter, invSearch]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['Order ID,Customer Name,Phone,Booking Type,Payment Mode,Transaction ID,Status,Total (INR),Created At\n'];
    const rows = recentOrders.map(o => 
      `"${o.id}","${o.customerName}","${o.customerPhone}","${o.bookingType}","${o.payment.method}","${o.payment.transactionId}","${o.payment.status}",${o.payment.total},"${o.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nikkys_Maggie_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add new dish handler
  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    addMenuItem({
      name: newDishName.trim(),
      category: newDishCategory,
      price: Number(newDishPrice),
      description: newDishDesc.trim() || 'Freshly prepared specialty at Nikky Maggie House.',
      isVeg: newDishVeg,
      stock: Number(newDishStock),
      initialStock: Number(newDishStock),
      imageUrl: newDishVeg 
        ? 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
      preparationTime: '8-10 mins'
    });

    setNewDishName('');
    setNewDishDesc('');
    setShowAddDishModal(false);
  };

  // ADMIN SECURITY GATE: If not logged in as Admin, require credentials
  if (currentUser.role !== 'admin') {
    return <AdminLoginModal isOpen={true} onClose={() => setActiveTab('menu')} />;
  }

  if (false) {
    const handleAuthSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      const ok = loginAsAdmin(authEmail, authPassword);
      if (!ok) {
        setAuthError('Access Denied: Invalid email or password. Please check the credentials below.');
      }
    };

    const handleQuickFill = () => {
      setAuthEmail(adminCredentials.username);
      setAuthPassword(adminCredentials.password);
      setAuthError('');
    };

    return (
      <div className="max-w-md mx-auto my-8 sm:my-12 px-4 py-4 sm:py-8">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-neutral-900 dark:text-neutral-100">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              Admin & Kitchen Portal Protected
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Please enter manager credentials to access live kitchen orders, transactions, and store settings.
            </p>
          </div>

          {/* Credentials Helper Card */}
          <div className="bg-neutral-50 dark:bg-neutral-950 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Active Admin Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                1-Click Auto-Fill
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Username / Email</span>
                <span className="text-neutral-900 dark:text-neutral-200 font-bold truncate block">{adminCredentials.username}</span>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Password / PIN</span>
                <span className="text-neutral-900 dark:text-neutral-200 font-bold block">{adminCredentials.password}</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Admin Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="admin@nikkys.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Password / Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-bold border border-neutral-200 dark:border-neutral-800 transition-colors"
            >
              Cancel & Return to Customer Menu
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8 overflow-x-hidden">
      
      {/* Admin Title & Portal Switcher Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-neutral-50">
              Admin & Kitchen Management Portal
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Protected Session</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
            <span>Logged in as: <strong className="text-amber-400">{currentUser.email || 'admin@nikkys.com'}</strong></span>
            <span>•</span>
            <span>Real-time payment history monitor, kitchen dispatch, stock control & analytics</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              logout();
            }}
            className="px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Lock the admin panel and logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock & Logout</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('menu');
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            title="Switch directly to the customer self-ordering kiosk"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Open Customer Kiosk</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded-2xl overflow-x-auto border border-neutral-200 dark:border-neutral-700/60">
        <button
          onClick={() => setAdminTab('transactions')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            adminTab === 'transactions'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Payment History & Monitor ({recentOrders.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('kitchen')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            adminTab === 'kitchen'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Live Kitchen Queue</span>
        </button>

        <button
          onClick={() => setAdminTab('inventory')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            adminTab === 'inventory'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Live Stock & Inventory ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            adminTab === 'analytics'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Financial Analytics</span>
        </button>

        <button
          onClick={() => setAdminTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            adminTab === 'security'
              ? 'bg-amber-500 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Admin Security & Credentials</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Revenue */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {t('total_revenue')}
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 font-display">
                  ₹{analytics.totalRevenue.toLocaleString()}
                </h3>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +18.4%
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Across all completed customer bookings</p>
            </div>

            {/* Total Orders */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {t('total_orders')}
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 font-display">
                  {analytics.totalOrdersCount}
                </h3>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +12%
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Dine-in & counter takeaways</p>
            </div>

            {/* Average Order Value */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {t('avg_order_val')}
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 font-display">
                  ₹{analytics.avgOrderValue}
                </h3>
                <span className="text-xs font-medium text-neutral-400">per booking</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Driven by Maggie add-ons & combos</p>
            </div>

            {/* Stock Health */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Stock Health
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 font-display">
                  {menuItems.length - analytics.outOfStockCount}/{menuItems.length}
                </h3>
                <span className="text-xs font-bold text-neutral-500">In Stock</span>
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                {analytics.lowStockCount} items running low (&lt;10 portions)
              </p>
            </div>

          </div>

          {/* Middle Charts: 7-Day Revenue Trends & Peak Hourly Footfall */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 7-Day Revenue Trend (2 cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    7-Day Booking Revenue & Orders Volume
                  </h4>
                  <p className="text-xs text-neutral-400">Daily financial breakdown at Nikky's Maggie House</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                  Current Week
                </span>
              </div>

              {/* Responsive SVG Bar / Line Trend Graphic */}
              <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {analytics.dayTrends.map((d, i) => {
                  const maxRev = Math.max(...analytics.dayTrends.map(t => t.revenue));
                  const heightPercent = Math.round((d.revenue / maxRev) * 85);

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-2 py-1 rounded-md shadow-md text-center pointer-events-none whitespace-nowrap -translate-y-1">
                        ₹{d.revenue} ({d.orders} orders)
                      </div>

                      {/* Bar */}
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[42px] rounded-t-xl bg-linear-to-t from-amber-500 to-orange-400 group-hover:from-amber-600 group-hover:to-orange-500 transition-all shadow-xs"
                      />

                      {/* Day Label */}
                      <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>Peak day: Sunday (Special Chicken Pulav Feast)</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Total Weekly Est: ₹{analytics.dayTrends.reduce((s, d) => s + d.revenue, 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Peak Rush Hours Breakdown */}
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Peak Footfall Distribution
                </h4>
                <p className="text-xs text-neutral-400">Diner flow by time period</p>
              </div>

              <div className="space-y-4 pt-2">
                {analytics.hourlyPeak.map((hour, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {hour.label}
                      </span>
                      <span className="font-bold text-neutral-500">{hour.count}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${hour.count}%` }} 
                        className={`h-full ${hour.color} rounded-full transition-all duration-500`}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400">{hour.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row: Category Revenue Share & Best Selling Dishes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Revenue Share */}
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-500" />
                Category Revenue Share
              </h4>

              <div className="space-y-3">
                {analytics.categoryList.slice(0, 6).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cat.category}</span>
                      <span className="text-neutral-400">({cat.count} sold)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-neutral-900 dark:text-neutral-100">₹{cat.amount}</span>
                      <span className="text-[11px] text-neutral-400 ml-2">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Dishes Leaderboard */}
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Top Selling Menu Items
              </h4>

              <div className="space-y-3">
                {analytics.topItems.map((entry, index) => (
                  <div key={entry.item.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50/60 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          {getItemName(entry.item)}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          ₹{entry.item.price} • {entry.count} portions ordered
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-50">
                        ₹{entry.revenue}
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">High Demand</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB: PAYMENT HISTORY & MONITOR */}
      {adminTab === 'transactions' && (
        <div className="space-y-5">
          
          {/* Real-Time Payment Breakdown KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Settled Revenue</span>
              <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{analytics.totalRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500">Across {recentOrders.length} transactions (last 6 months)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block flex items-center gap-1">
                <QrCode className="w-3 h-3 text-amber-500" />
                <span>UPI Collections</span>
              </span>
              <p className="text-xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                ₹{recentOrders.filter(o => o.payment.method === 'upi' && o.payment.status === 'paid').reduce((s, o) => s + o.payment.total, 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500">GPay, PhonePe, Paytm QR</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block flex items-center gap-1">
                <Banknote className="w-3 h-3 text-emerald-500" />
                <span>Cash / Counter</span>
              </span>
              <p className="text-xl font-extrabold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                ₹{recentOrders.filter(o => o.payment.method === 'counter' && o.payment.status === 'paid').reduce((s, o) => s + o.payment.total, 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500">Direct Register</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Avg Bill Size</span>
              <p className="text-xl font-extrabold font-mono text-amber-500 mt-1">
                ₹{analytics.avgOrderValue}
              </p>
              <span className="text-[10px] text-neutral-500">Per diner ticket</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txnSearch}
                onChange={e => setTxnSearch(e.target.value)}
                placeholder="Search transaction ID, customer name or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={txnStatusFilter}
                onChange={e => setTxnStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid & Settled</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={txnMethodFilter}
                onChange={e => setTxnMethodFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                <option value="all">All Payment Modes</option>
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="counter">Counter / Cash</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Download CSV report"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 uppercase font-bold text-[10px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Order & Txn Ref</th>
                    <th className="p-3.5">Customer (Guest)</th>
                    <th className="p-3.5">Token & Type</th>
                    <th className="p-3.5">Items Summary</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Paid Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date / Time</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-neutral-400">
                        No transactions match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="p-3.5">
                          <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                            #{order.id}
                          </p>
                          <p className="font-mono text-[10px] text-neutral-400 truncate max-w-[130px]" title={order.payment.transactionId}>
                            {order.payment.transactionId}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {order.customerName}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono">{order.customerPhone || 'Guest'}</p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-mono font-black text-amber-600 dark:text-amber-400">
                            #{order.tokenNumber || 'A-12'}
                          </p>
                          <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
                            {order.bookingType === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                          </span>
                        </td>

                        <td className="p-3.5 text-neutral-600 dark:text-neutral-300 max-w-xs truncate">
                          {order.items.map(ci => `${ci.quantity}x ${getItemName(ci.item)}`).join(', ')}
                        </td>

                        <td className="p-3.5">
                          <span className="uppercase font-semibold text-neutral-700 dark:text-neutral-300">
                            {order.payment.method} {order.payment.upiApp ? `(${order.payment.upiApp})` : ''}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-extrabold text-neutral-900 dark:text-neutral-50 font-mono">
                            ₹{order.payment.total}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.payment.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : order.payment.status === 'refunded'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <span className="status-badge">{order.payment.status === 'pending' ? 'PENDING - AWAITING CONFIRMATION' : order.payment.status}</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-neutral-500 text-[11px] whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {order.payment.method === 'counter' && order.payment.status === 'pending' && (
                            <button
                              onClick={() => updatePaymentStatus(order.id, 'paid')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                              title="Mark counter payment as received"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Payment Received</span>
                            </button>
                          )}
                          {/* View & Print Official Bill */}
                          <button
                            onClick={() => setActiveReceiptOrder(order)}
                            className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500 hover:text-neutral-950 text-amber-600 dark:text-amber-300 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                            title="View & Print Official Bill / Tax Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Bill</span>
                          </button>

                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME INVENTORY MANAGER */}
      {adminTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invSearch}
                onChange={e => setInvSearch(e.target.value)}
                placeholder="Search dish to update stock..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={invCategoryFilter}
                onChange={e => setInvCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                <option value="all">All Categories</option>
                <option value="tea_coffee">Tea & Coffee</option>
                <option value="maggie">Maggie</option>
                <option value="snacks">Snacks</option>
                <option value="dosa">Dosa</option>
                <option value="pizza">Pizza</option>
                <option value="rice_varieties">Rice Varieties</option>
                <option value="chapati">Chapati</option>
                <option value="non_veg">Non Veg</option>
                <option value="specials">Specials</option>
              </select>

              <button
                onClick={() => setShowAddDishModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Dish</span>
              </button>
            </div>
          </div>

          {/* Live Inventory List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map(item => {
              const isLow = item.stock <= 5 && item.stock > 0;
              const isOut = item.stock <= 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border bg-white dark:bg-neutral-900 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                    isOut 
                      ? 'border-red-300 dark:border-red-900/60 bg-red-50/20' 
                      : isLow 
                      ? 'border-amber-300 dark:border-amber-900/60' 
                      : 'border-neutral-200/90 dark:border-neutral-800/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                          {getItemName(item)}
                        </h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 capitalize mt-0.5">
                        {item.category.replace('_', ' ')} • ₹{item.price}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isOut 
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                        : isLow 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isOut ? 'Sold Out' : isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  {/* Stock Quantity Adjuster */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase">Current Portions</span>
                      <p className="text-lg font-extrabold text-neutral-900 dark:text-neutral-50">
                        {item.stock} <span className="text-xs font-normal text-neutral-400">units</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateItemStock(item.id, Math.max(0, item.stock - 5))}
                        className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs font-bold"
                        title="-5 portions"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateItemStock(item.id, Math.max(0, item.stock - 1))}
                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300"
                        title="-1 portion"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateItemStock(item.id, item.stock + 1)}
                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                        title="+1 portion"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateItemStock(item.id, item.stock + 10)}
                        className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold"
                        title="+10 portions"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Dish Modal */}
          {showAddDishModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div 
                className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    Add New Dish to Menu
                  </h3>
                  <button
                    onClick={() => setShowAddDishModal(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateDish} className="p-5 space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Dish Name</label>
                    <input
                      type="text"
                      value={newDishName}
                      onChange={e => setNewDishName(e.target.value)}
                      required
                      placeholder="e.g. Cheese Burst Egg Maggie"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Category</label>
                      <select
                        value={newDishCategory}
                        onChange={e => setNewDishCategory(e.target.value as MenuItem['category'])}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="tea_coffee">Tea & Coffee</option>
                        <option value="maggie">Maggie</option>
                        <option value="snacks">Snacks</option>
                        <option value="dosa">Dosa</option>
                        <option value="pizza">Pizza</option>
                        <option value="rice_varieties">Rice Varieties</option>
                        <option value="chapati">Chapati</option>
                        <option value="non_veg">Non-Veg</option>
                        <option value="specials">Sunday Special</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={newDishPrice}
                        onChange={e => setNewDishPrice(Number(e.target.value))}
                        required
                        min="5"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Initial Stock</label>
                      <input
                        type="number"
                        value={newDishStock}
                        onChange={e => setNewDishStock(Number(e.target.value))}
                        required
                        min="1"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Type</label>
                      <button
                        type="button"
                        onClick={() => setNewDishVeg(!newDishVeg)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold ${
                          newDishVeg 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-500' 
                            : 'bg-red-50 text-red-800 border-red-500'
                        }`}
                      >
                        {newDishVeg ? 'Pure Veg' : 'Non-Veg'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Description</label>
                    <textarea
                      value={newDishDesc}
                      onChange={e => setNewDishDesc(e.target.value)}
                      rows={2}
                      placeholder="Ingredients and special taste description..."
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDishModal(false)}
                      className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                    >
                      Add Dish
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: LIVE KITCHEN QUEUE & STATUS UPDATER */}
      {adminTab === 'kitchen' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold text-amber-950 dark:text-amber-200">
                  Kitchen Dispatch & Live Status Board
                </p>
                <p className="text-amber-800 dark:text-amber-400 text-[11px]">
                  Updating any status immediately triggers a push notification to the customer's phone/screen!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-amber-600 dark:text-amber-400">
                        #{order.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-amber-500 text-neutral-950">
                        Token #{order.tokenNumber || 'A-12'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {order.bookingType === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                    </span>
                  </div>

                  <div className="py-2 text-xs">
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">
                      {order.customerName}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {order.timeSlot} • ₹{order.payment.total}
                    </p>
                    {order.notes && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg mt-1 font-medium">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Items to prepare */}
                  <div className="space-y-1 py-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    {order.items.map((ci, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{ci.quantity}x {getItemName(ci.item)}</span>
                        {ci.selectedSpiceLevel && <span className="text-orange-500 font-bold">{ci.selectedSpiceLevel}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Switcher Action Buttons */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">
                    Update Order State
                  </span>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-colors ${
                        order.status === 'preparing'
                          ? 'bg-amber-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      Cooking
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-colors ${
                        order.status === 'ready'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      Ready
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-colors ${
                        order.status === 'completed'
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      Served
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN CREDENTIALS & SECURITY */}
      {adminTab === 'security' && (
        <div className="space-y-6 max-w-5xl">
          
          {/* Header */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Admin Security & Credentials Manager</h3>
              </div>
              <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                You can change the admin username, display name, and password PIN anytime below. The settings are saved in persistent storage and configured in <span className="text-amber-400 font-mono">/src/data/adminCredentials.ts</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security Active</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Current Active Credentials Overview */}
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Current Active Credentials</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Live</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                    <span className="text-[11px] text-neutral-500 block font-medium">Manager Display Name</span>
                    <span className="text-neutral-100 font-bold font-mono text-sm">{adminCredentials.displayName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                    <span className="text-[11px] text-neutral-500 block font-medium">Username / Login Email</span>
                    <span className="text-amber-400 font-bold font-mono text-sm break-all">{adminCredentials.username}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-500 font-medium">Current Secret PIN / Password</span>
                      <button
                        type="button"
                        onClick={() => setShowCredPassword(!showCredPassword)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold"
                      >
                        {showCredPassword ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    <span className="text-neutral-200 font-bold font-mono text-sm tracking-wider">
                      {showCredPassword ? adminCredentials.password : '••••••••••••'}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-500 pt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>Last updated: {new Date(adminCredentials.updatedAt).toLocaleDateString()} at {new Date(adminCredentials.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetAdminCredentialsState();
                    setCredSuccessMsg('Credentials restored to factory default values.');
                    setCredErrorMsg('');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-bold border border-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Factory Defaults</span>
                </button>
              </div>

              {/* Source File Location Card */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-300 font-bold text-[11px]">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>File Location in Workspace</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-mono bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800/70 text-amber-300">
                  /src/data/adminCredentials.ts
                </p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  You can also directly edit the source TypeScript file above to change the permanent hardcoded defaults if preferred.
                </p>
              </div>
            </div>

            {/* Right Column: Modify Credentials Form */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Modify Admin Credentials</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Update the credentials needed to access the Admin & Kitchen Portal.
                  </p>
                </div>

                {/* Feedback Alerts */}
                {credSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{credSuccessMsg}</span>
                  </div>
                )}

                {credErrorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-semibold">{credErrorMsg}</span>
                  </div>
                )}

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setCredErrorMsg('');
                    setCredSuccessMsg('');

                    if (!credUsername.trim()) {
                      setCredErrorMsg('Username or Email cannot be empty.');
                      return;
                    }

                    if (!credPassword.trim() || credPassword.trim().length < 4) {
                      setCredErrorMsg('Password or PIN must be at least 4 characters.');
                      return;
                    }

                    if (credPassword.trim() !== credConfirmPass.trim()) {
                      setCredErrorMsg('New Password and Confirm Password do not match.');
                      return;
                    }

                    updateAdminCredentials({
                      username: credUsername.trim(),
                      displayName: credDisplayName.trim() || "Nikky's Store Manager",
                      password: credPassword.trim(),
                      updatedAt: new Date().toISOString(),
                    });

                    setCredSuccessMsg('Admin credentials updated and saved successfully!');
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 block">
                        Manager / Display Name
                      </label>
                      <input
                        type="text"
                        value={credDisplayName}
                        onChange={e => setCredDisplayName(e.target.value)}
                        placeholder="Nikky's Store Manager"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 font-medium"
                      />
                      <span className="text-[10px] text-neutral-500">Visible on receipts and manager bar</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 block">
                        Admin Login Username / Email
                      </label>
                      <input
                        type="text"
                        value={credUsername}
                        onChange={e => setCredUsername(e.target.value)}
                        placeholder="admin@nikkys.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 font-mono"
                      />
                      <span className="text-[10px] text-neutral-500">Username to unlock the admin portal</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 block">
                        New Password / Security PIN
                      </label>
                      <div className="relative">
                        <input
                          type={showCredPassword ? 'text' : 'password'}
                          value={credPassword}
                          onChange={e => setCredPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCredPassword(!showCredPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                        >
                          {showCredPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-neutral-500">Minimum 4 characters or digits</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 block">
                        Confirm New Password / PIN
                      </label>
                      <input
                        type={showCredPassword ? 'text' : 'password'}
                        value={credConfirmPass}
                        onChange={e => setCredConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 font-mono"
                      />
                      <span className="text-[10px] text-neutral-500">Must match the password entered on left</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Apply New Credentials</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCredUsername(DEFAULT_ADMIN_CREDENTIALS.username);
                        setCredDisplayName(DEFAULT_ADMIN_CREDENTIALS.displayName);
                        setCredPassword(DEFAULT_ADMIN_CREDENTIALS.password);
                        setCredConfirmPass(DEFAULT_ADMIN_CREDENTIALS.password);
                        setCredSuccessMsg('Form reset to default values. Click "Save & Apply" to confirm.');
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-bold border border-neutral-800 transition-colors"
                    >
                      Populate Defaults
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
