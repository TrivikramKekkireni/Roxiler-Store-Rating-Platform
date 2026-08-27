import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import {
  Store,
  Shield,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
  Building2,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (userRole) => {
    switch (userRole) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Shield className="w-3 h-3" />
            System Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Building2 className="w-3 h-3" />
            Store Owner
          </span>
        );
      case 'NORMAL_USER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <User className="w-3 h-3" />
            Normal User
          </span>
        );
    }
  };

  const getHomeLink = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'STORE_OWNER') return '/owner/dashboard';
    return '/stores';
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link
                to={getHomeLink()}
                className="flex items-center gap-2.5 group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Roxiler
                  </span>
                  <span className="text-[10px] tracking-wider block font-semibold text-brand-400 uppercase -mt-1">
                    Store Rating
                  </span>
                </div>
              </Link>

              {/* Navigation links based on role */}
              {user && (
                <nav className="hidden md:flex items-center gap-1">
                  {role === 'ADMIN' && (
                    <Link
                      to="/admin/dashboard"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {role === 'STORE_OWNER' && (
                    <Link
                      to="/owner/dashboard"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      Store Dashboard
                    </Link>
                  )}
                  {role === 'NORMAL_USER' && (
                    <Link
                      to="/stores"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      Browse & Rate Stores
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* Right side Profile & Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-semibold text-white max-w-[150px] truncate">
                        {user.name}
                      </div>
                      <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl p-2 shadow-2xl z-50 border border-slate-800 animate-fade-in">
                        <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          <div className="mt-2 sm:hidden">{getRoleBadge(user.role)}</div>
                        </div>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsPasswordModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                        >
                          <KeyRound className="w-4 h-4 text-brand-400" />
                          Update Password
                        </button>

                        <div className="my-1 border-t border-slate-800/60" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-lg shadow-brand-600/30"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
