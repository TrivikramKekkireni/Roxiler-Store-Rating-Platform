import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import {
  Building2,
  Star,
  Users,
  MapPin,
  Mail,
  Calendar,
  Loader2,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOwnerDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/owner/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching owner dashboard:', err);
      setError(
        err.response?.data?.message ||
        'Unable to fetch store metrics. Ensure your store is assigned.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-xs text-slate-400">Loading your store dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-card rounded-3xl p-10 border border-slate-800">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Store Profile Not Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            {error || 'No store has been linked to your account yet. Please contact the administrator.'}
          </p>
          <button
            onClick={fetchOwnerDashboard}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { store, metrics, customerRatings } = dashboardData;
  const distribution = metrics.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 flex-shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                  Store Owner Portal
                </span>
                <span className="text-[11px] text-slate-400">Store ID #{store.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{store.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{store.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{store.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Rating Highlight Box */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex-shrink-0">
            <div className="text-center pr-4 border-r border-slate-800">
              <div className="text-4xl font-black text-amber-400 leading-none">
                {metrics.averageRating > 0 ? metrics.averageRating : '0.0'}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Out of 5.0</div>
            </div>
            <div>
              <StarRating rating={metrics.averageRating} size="md" />
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Based on <span className="text-white font-bold">{metrics.totalReviews}</span> verified {metrics.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Rating Breakdown Distribution */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Ratings Distribution</span>
          </h3>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((starVal) => {
              const count = distribution[starVal] || 0;
              const percentage = metrics.totalReviews > 0 ? Math.round((count / metrics.totalReviews) * 100) : 0;

              return (
                <div key={starVal} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-14 text-slate-300 font-semibold">
                    <span>{starVal}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-slate-400 font-mono text-[11px]">
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Insights */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Customer Satisfaction Highlights</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your store rating is calculated in real-time from all verified normal user submissions. Customers can modify their feedback at any time. Maintaining an average rating above 4.5 boosts store visibility in the normal user directory.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Reviews</span>
              <span className="text-lg font-black text-white">{metrics.totalReviews}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">5-Star Reviews</span>
              <span className="text-lg font-black text-emerald-400">{distribution[5] || 0}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Satisfaction</span>
              <span className="text-lg font-black text-amber-400">
                {metrics.averageRating ? `${Math.round((metrics.averageRating / 5) * 100)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Ratings History Table */}
      <div className="glass-card rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              <span>Customer Reviews & Feedback History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              List of all users who submitted ratings for your store
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {customerRatings.length} Total Submissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Customer Email</th>
                <th className="px-6 py-3.5">Address</th>
                <th className="px-6 py-3.5">Submitted Rating</th>
                <th className="px-6 py-3.5">Date / Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customerRatings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p>No customer ratings submitted yet for your store.</p>
                  </td>
                </tr>
              ) : (
                customerRatings.map((cr) => (
                  <tr key={cr.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xs">
                          {cr.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <div>{cr.user?.name}</div>
                          <div className="text-[10px] text-slate-500">User ID #{cr.user?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{cr.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={cr.user?.address}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{cr.user?.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={cr.rating} size="sm" />
                        <span className="text-xs font-bold text-amber-400">
                          {cr.rating} / 5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(cr.updatedAt || cr.createdAt).toLocaleString()}</span>
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
  );
};

export default OwnerDashboard;
