import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Key, Mail, Landmark, ArrowRight, User, Wrench, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../utils/constants';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/issues');
    } else {
      setError(res.message);
    }
  };

  const fillDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'citizen': return User;
      case 'field_worker': return Wrench;
      case 'department_admin': return Building2;
      case 'system_admin': return ShieldCheck;
      default: return User;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-xs mb-3">
            <Landmark className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to CivicPulse</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Access your civic complaint portal account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* 1-Click Demo Accounts */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Quick Demo Sign-In:</span>
              <span className="text-[11px] text-slate-500 font-normal">Select a persona</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = getRoleIcon(acc.role);
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className={`p-2 rounded-md text-left transition-colors flex items-center gap-2 border text-xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <div className="truncate">
                      <div className="font-semibold truncate">{acc.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs py-2.5 rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-700 hover:text-blue-800 font-semibold ml-1">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
