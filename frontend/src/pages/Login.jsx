import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Key, Mail, Shield, Sparkles, CheckCircle2, ArrowRight, Zap, Building2, Wrench, ShieldCheck, User } from 'lucide-react';
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
      default: return Sparkles;
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Hero Feature Showcase (Human-Crafted Brand Column) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl" />
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Live Smart City Engine</span>
            </div>

            <div>
              <h1 className="text-3xl font-display font-extrabold text-white tracking-tight leading-snug">
                The Next Generation of <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Civic Infrastructure</span>
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed mt-3">
                Multimodal AI triaging, automated geo-clustering, and citizen verification in one unified portal.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                'Instant Multimodal AI Issue Categorization',
                'Automated Duplicate Report Suppression',
                'Geographic Hotspot & Cluster Mapping',
                'Photo-Verified Field Worker Resolution'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">99.8% Triage Accuracy</div>
                <div className="text-[10px] text-slate-400">Powered by Neural NLP & GIS</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>
        </div>

        {/* Right Auth Form Column */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-400 mt-0.5">Welcome back! Please enter your credentials</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-glow">
              <LogIn className="w-5 h-5 text-white" />
            </div>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Instant Demo Accounts (Grid with Role Avatars) */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Instant Demo Autofill
              </span>
              <span className="text-[10px] text-slate-500">1-Click Sign In</span>
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
                    className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 border ${
                      isSelected 
                        ? 'border-cyan-500/60 bg-cyan-500/10 shadow-glow-cyan' 
                        : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{acc.badge}</div>
                      <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@civicpulse.org"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs py-3.5 rounded-xl shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating Session...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors">
              Create citizen account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

