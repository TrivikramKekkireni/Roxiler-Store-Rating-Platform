import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Shield,
  User,
  MapPin,
  Mail,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    roleCounts: { ADMIN: 0, NORMAL_USER: 0, STORE_OWNER: 0 },
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userFilters, setUserFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    search: '',
  });
  const [userSort, setUserSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });

  // Stores State
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storeFilters, setStoreFilters] = useState({
    name: '',
    email: '',
    address: '',
    search: '',
  });
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', sortOrder: 'asc' });

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [availableOwners, setAvailableOwners] = useState([]);

  // Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = {
        ...userFilters,
        sortBy: userSort.sortBy,
        sortOrder: userSort.sortOrder,
      };
      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const params = {
        ...storeFilters,
        sortBy: storeSort.sortBy,
        sortOrder: storeSort.sortOrder,
      };
      const res = await api.get('/admin/stores', { params });
      if (res.data.success) {
        setStores(res.data.data.stores);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  // Fetch Available Owners for Store creation
  const fetchAvailableOwners = async () => {
    try {
      const res = await api.get('/admin/available-owners');
      if (res.data.success) {
        setAvailableOwners(res.data.data.users);
      }
    } catch (err) {
      console.error('Error fetching available owners:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, userSort, storeSort]);

  const handleUserFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStoreFilterSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const resetUserFilters = () => {
    setUserFilters({ name: '', email: '', address: '', role: '', search: '' });
    setTimeout(() => fetchUsers(), 0);
  };

  const resetStoreFilters = () => {
    setStoreFilters({ name: '', email: '', address: '', search: '' });
    setTimeout(() => fetchStores(), 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-sm ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
              Administrator Hub
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">System Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor ecosystem analytics, audit users, and manage registered storefronts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => {
              fetchAvailableOwners();
              setIsAddStoreOpen(true);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Users */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Users</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-brand-400" /> : stats.totalUsers}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-medium">{stats.roleCounts?.NORMAL_USER || 0} Normal</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">{stats.roleCounts?.ADMIN || 0} Admins</span>
          </div>
        </div>

        {/* Total Stores */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Registered Stores</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-cyan-400" /> : stats.totalStores}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-medium">{stats.roleCounts?.STORE_OWNER || 0} Store Owners</span>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Submitted Ratings</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400/20" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-amber-400" /> : stats.totalRatings}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active user feedback verified</span>
          </div>
        </div>

        {/* Role Ratio */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Role Composition</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 h-7">
            <div className="h-2 rounded-full bg-brand-500 flex-1" title="Normal Users" />
            <div className="h-2 rounded-full bg-emerald-500 flex-1" title="Store Owners" />
            <div className="h-2 rounded-full bg-indigo-500 flex-1" title="System Admins" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span>Users</span>
            <span>Owners</span>
            <span>Admins</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'stores'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Stores Directory ({stores.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div>
          {/* Filters Bar */}
          <form
            onSubmit={handleUserFilterSubmit}
            className="glass-panel p-4 rounded-2xl mb-6 border border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
          >
            {/* Search */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Universal Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                  placeholder="Name, email, address..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Filter by Role */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Role Filter
              </label>
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="NORMAL_USER">Normal User</option>
              </select>
            </div>

            {/* Filter by Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Name Filter
              </label>
              <input
                type="text"
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                placeholder="Filter by name..."
                className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Filter by Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Address Filter
              </label>
              <input
                type="text"
                value={userFilters.address}
                onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                placeholder="Filter by city/street..."
                className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={resetUserFilters}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Users Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px] tracking-wider">
                  <tr>
                    <th
                      className="px-5 py-3.5 cursor-pointer hover:text-white"
                      onClick={() =>
                        setUserSort({
                          sortBy: 'name',
                          sortOrder: userSort.sortBy === 'name' && userSort.sortOrder === 'asc' ? 'desc' : 'asc',
                        })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span>User Name</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="px-5 py-3.5 cursor-pointer hover:text-white"
                      onClick={() =>
                        setUserSort({
                          sortBy: 'email',
                          sortOrder: userSort.sortBy === 'email' && userSort.sortOrder === 'asc' ? 'desc' : 'asc',
                        })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Email</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5">Address</th>
                    <th
                      className="px-5 py-3.5 cursor-pointer hover:text-white"
                      onClick={() =>
                        setUserSort({
                          sortBy: 'role',
                          sortOrder: userSort.sortBy === 'role' && userSort.sortOrder === 'asc' ? 'desc' : 'asc',
                        })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Role</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5">Store & Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
                        <span>Loading users directory...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No users match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <div>{u.name}</div>
                              <div className="text-[10px] font-normal text-slate-500">ID #{u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{u.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 max-w-xs truncate" title={u.address}>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{u.address}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {u.role === 'ADMIN' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 inline-flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              System Admin
                            </span>
                          )}
                          {u.role === 'STORE_OWNER' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              Store Owner
                            </span>
                          )}
                          {u.role === 'NORMAL_USER' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30 inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Normal User
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {u.role === 'STORE_OWNER' ? (
                            u.store ? (
                              <div>
                                <div className="font-semibold text-slate-200 text-xs mb-1">
                                  {u.store.name}
                                </div>
                                <div className="flex items-center gap-2">
                                  <StarRating rating={u.storeRating || 0} size="xs" />
                                  <span className="text-[11px] font-bold text-amber-400">
                                    {u.storeRating !== null ? `${u.storeRating} / 5` : 'No reviews'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">No store assigned</span>
                            )
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
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

      {/* TAB 2: STORES DIRECTORY */}
      {activeTab === 'stores' && (
        <div>
          {/* Filters Bar */}
          <form
            onSubmit={handleStoreFilterSubmit}
            className="glass-panel p-4 rounded-2xl mb-6 border border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {/* Search */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Store Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storeFilters.search}
                  onChange={(e) => setStoreFilters({ ...storeFilters, search: e.target.value })}
                  placeholder="Store name or address..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Filter by Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Filter by Name
              </label>
              <input
                type="text"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                placeholder="Store name..."
                className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Filter by Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Filter by Address
              </label>
              <input
                type="text"
                value={storeFilters.address}
                onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                placeholder="Address or city..."
                className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={resetStoreFilters}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Stores Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px] tracking-wider">
                  <tr>
                    <th
                      className="px-5 py-3.5 cursor-pointer hover:text-white"
                      onClick={() =>
                        setStoreSort({
                          sortBy: 'name',
                          sortOrder: storeSort.sortBy === 'name' && storeSort.sortOrder === 'asc' ? 'desc' : 'asc',
                        })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Store Name</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5">Store Email</th>
                    <th className="px-5 py-3.5">Address</th>
                    <th className="px-5 py-3.5">Assigned Owner</th>
                    <th
                      className="px-5 py-3.5 cursor-pointer hover:text-white"
                      onClick={() =>
                        setStoreSort({
                          sortBy: 'rating',
                          sortOrder: storeSort.sortBy === 'rating' && storeSort.sortOrder === 'desc' ? 'asc' : 'desc',
                        })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Overall Rating</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingStores ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
                        <span>Loading stores directory...</span>
                      </td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No stores found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <div>{s.name}</div>
                              <div className="text-[10px] font-normal text-slate-500">ID #{s.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{s.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 max-w-xs truncate" title={s.address}>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{s.address}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {s.owner ? (
                            <div>
                              <div className="font-semibold text-slate-200 text-xs">{s.owner.name}</div>
                              <div className="text-[10px] text-slate-400">{s.owner.email}</div>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <StarRating rating={s.overallRating} size="sm" />
                            <div>
                              <span className="text-xs font-bold text-amber-400">
                                {s.overallRating > 0 ? s.overallRating : '0'}
                              </span>
                              <span className="text-[10px] text-slate-500 ml-1">
                                ({s.totalRatingsCount} {s.totalRatingsCount === 1 ? 'review' : 'reviews'})
                              </span>
                            </div>
                          </div>
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

      {/* MODAL 1: ADD USER MODAL */}
      {isAddUserOpen && (
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onSuccess={() => {
            fetchUsers();
            fetchStats();
            showToast('User created successfully.');
          }}
        />
      )}

      {/* MODAL 2: ADD STORE MODAL */}
      {isAddStoreOpen && (
        <AddStoreModal
          isOpen={isAddStoreOpen}
          availableOwners={availableOwners}
          onClose={() => setIsAddStoreOpen(false)}
          onSuccess={() => {
            fetchStores();
            fetchStats();
            showToast('Store created successfully.');
          }}
        />
      )}
    </div>
  );
};

// Internal Add User Modal
const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('NORMAL_USER');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation
  const isNameValid = name.length >= 20 && name.length <= 60;
  const isPassLength = password.length >= 8 && password.length <= 16;
  const hasPassUpper = /[A-Z]/.test(password);
  const hasPassSpecial = /[!@#$%^&*]/.test(password);
  const isPasswordValid = isPassLength && hasPassUpper && hasPassSpecial;
  const isAddressValid = address.trim().length > 0 && address.length <= 400;

  const isFormValid = isNameValid && isPasswordValid && isAddressValid && email.includes('@');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters long.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be 8-16 chars, contain 1 uppercase letter and 1 special character.');
      return;
    }
    if (!isAddressValid) {
      setError('Address must not exceed 400 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/users', {
        name,
        email,
        password,
        address,
        role,
      });
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New User</h3>
              <p className="text-[11px] text-slate-400">Create system administrators or users</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Name</label>
              <span className={`text-[10px] ${isNameValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                {name.length}/60 (Min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full legal name (20-60 characters)"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="NORMAL_USER">Normal User</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <span className={`text-[10px] ${isPasswordValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                8-16 chars, 1 uppercase, 1 special
              </span>
            </div>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. Secret@12345"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address (up to 400 characters)"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Internal Add Store Modal
const AddStoreModal = ({ isOpen, availableOwners, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.length < 3 || name.length > 100) {
      setError('Store name must be between 3 and 100 characters.');
      return;
    }
    if (address.length > 400) {
      setError('Address must not exceed 400 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/stores', {
        name,
        email,
        address,
        ownerId: ownerId ? parseInt(ownerId, 10) : null,
      });
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Store</h3>
              <p className="text-[11px] text-slate-400">Register a new store and assign a store manager</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Store Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Supermarket & Grocery"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Store Official Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@storename.com"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Store Physical Address</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Store location address (up to 400 characters)"
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Store Owner (Optional)</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Leave Unassigned --</option>
              {availableOwners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email}) - {o.role}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Selecting a user will automatically grant them Store Owner privileges.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/30"
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
