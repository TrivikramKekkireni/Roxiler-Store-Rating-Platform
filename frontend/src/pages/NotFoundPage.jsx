import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-10 max-w-md text-center border border-slate-800 shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <p className="text-sm font-semibold text-slate-300 mb-1">Page Not Found</p>
        <p className="text-xs text-slate-400 mb-6">
          The page you requested could not be located on the Roxiler platform.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
