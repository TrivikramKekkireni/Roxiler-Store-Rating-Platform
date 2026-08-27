import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Search,
  MapPin,
  Mail,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Edit3,
} from 'lucide-react';

export const UserStoresPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'rating'
  const [sortOrder, setSortOrder] = useState('asc');

  // Rating Modal / State
  const [ratingStore, setRatingStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [modalError, setModalError] = useState('');

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        name: nameFilter,
        address: addressFilter,
        sortBy,
        sortOrder,
      };
      const res = await api.get('/stores', { params });
      if (res.data.success) {
        setStores(res.data.data.stores);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleOpenRatingModal = (store) => {
    setRatingStore(store);
    setSelectedRating(store.userRating || 5);
    setModalError('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingStore) return;

    setSubmittingRating(true);
    setModalError('');

    try {
      const res = await api.post(`/stores/${ratingStore.id}/rate`, {
        rating: selectedRating,
      });

      if (res.data.success) {
        // Update store in state
        setStores((prev) =>
          prev.map((s) => {
            if (s.id === ratingStore.id) {
              return {
                ...s,
                userRating: selectedRating,
                overallRating: res.data.data.overallRating,
                totalRatingsCount: res.data.data.totalRatings,
              };
            }
            return s;
          })
        );

        showToast(
          ratingStore.userRating
            ? `Updated rating to ${selectedRating} stars for "${ratingStore.name}".`
            : `Submitted ${selectedRating}-star rating for "${ratingStore.name}".`
        );
        setRatingStore(null);
      }
    } catch (err) {
      setModalError(
        err.response?.data?.message || 'Failed to submit rating. Please try again.'
      );
    } finally {
      setSubmittingRating(false);
    }
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
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/15 text-brand-400 border border-brand-500/30 uppercase tracking-wide">
            Directory & Reviews
          </span>
        </div>
        <h1 className="text-3xl font-black text-white">Explore & Rate Stores</h1>
        <p className="text-xs text-slate-400 mt-1">
          Discover certified stores, check community ratings, and share your verified experience
        </p>
      </div>

      {/* Search & Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="glass-panel p-4 rounded-3xl mb-8 border border-slate-800 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Universal Search by Name or Address */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Store Name or Address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Dedicated Name Filter */}
          <div className="md:col-span-3">
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filter by Store Name..."
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Dedicated Address Filter */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              placeholder="Filter by Address/City..."
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Submit Search */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-2xl transition-all shadow-md shadow-brand-600/30"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setNameFilter('');
                setAddressFilter('');
                setTimeout(() => fetchStores(), 0);
              }}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <span>Found {stores.length} registered stores</span>
          <div className="flex items-center gap-3">
            <span>Sort by:</span>
            <button
              type="button"
              onClick={() => {
                setSortBy('name');
                setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                sortBy === 'name' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'
              }`}
            >
              <span>Name</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('rating');
                setSortOrder(sortBy === 'rating' && sortOrder === 'desc' ? 'asc' : 'desc');
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                sortBy === 'rating' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'
              }`}
            >
              <span>Rating</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </form>

      {/* Stores Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading verified stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Stores Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            We couldn't find any store matching your search criteria. Try modifying the keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((s) => (
            <div
              key={s.id}
              className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
            >
              <div>
                {/* Store Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600/20 to-cyan-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform flex-shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                        {s.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[170px]">{s.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{s.address}</span>
                </div>

                {/* Overall Rating Section */}
                <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Overall Rating
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={s.overallRating} size="sm" />
                      <span className="text-xs font-black text-amber-400">
                        {s.overallRating > 0 ? s.overallRating : '0.0'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Total Reviews</span>
                    <span className="text-xs font-semibold text-slate-300">
                      {s.totalRatingsCount} {s.totalRatingsCount === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User's Submitted Rating & Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                    Your Rating
                  </span>
                  {s.userRating ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      <span>{s.userRating} / 5 Stars</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Not rated yet</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenRatingModal(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md ${
                    s.userRating
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/20'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30'
                  }`}
                >
                  {s.userRating ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify Rating</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Rate Store</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Submission Modal */}
      {ratingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">
            <div className="text-center pb-4 border-b border-slate-800">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                {ratingStore.userRating ? 'Modify Store Rating' : 'Submit Store Rating'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{ratingStore.name}</p>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRatingSubmit} className="mt-6 space-y-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs text-slate-400 mb-3 font-medium">
                  Select your rating from 1 to 5 stars:
                </p>
                <StarRating
                  rating={selectedRating}
                  interactive={true}
                  size="lg"
                  onChange={(val) => setSelectedRating(val)}
                />
                <div className="mt-3 text-sm font-black text-amber-400">
                  {selectedRating === 1 && '1 Star - Poor'}
                  {selectedRating === 2 && '2 Stars - Fair'}
                  {selectedRating === 3 && '3 Stars - Good'}
                  {selectedRating === 4 && '4 Stars - Very Good'}
                  {selectedRating === 5 && '5 Stars - Excellent!'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingStore(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5"
                >
                  {submittingRating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{ratingStore.userRating ? 'Update Rating' : 'Submit Rating'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoresPage;
