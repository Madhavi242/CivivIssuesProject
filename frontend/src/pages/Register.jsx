import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Key, User, Phone, Shield, ArrowRight, CheckCircle2, Building2, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    phone: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(formData);
    if (res.success) {
      navigate('/issues');
    } else {
      setError(res.message);
    }
  };

  const roles = [
    { id: 'citizen', label: 'Citizen', icon: User, desc: 'Report & verify issues in your area' },
    { id: 'field_worker', label: 'Field Tech', icon: Wrench, desc: 'Resolve tasks & upload photo evidence' },
    { id: 'department_admin', label: 'Dept Admin', icon: Building2, desc: 'Triage & assign departmental crews' },
    { id: 'system_admin', label: 'Sys Admin', icon: ShieldCheck, desc: 'Full platform governance & SLAs' },
  ];

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Info Column */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Civic Participation Portal</span>
            </div>

            <div>
              <h1 className="text-3xl font-display font-extrabold text-white tracking-tight leading-snug">
                Join the <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Civic Revolution</span>
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed mt-3">
                Create an account to report potholes, water leaks, and streetlight outages directly to municipal field crews.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              {[
                'Real-time status updates on submitted issues',
                'AI-assisted priority & duplicate detection',
                'Earn civic reputation & community badges',
                'Direct photo-verification of city repairs'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <div className="p-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm text-xs text-slate-400">
            Already verified over <span className="text-white font-bold">12,400+</span> community issues across metropolitan zones.
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter your details to register on CivicPulse</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Priya Patel"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@example.com"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full text-xs pl-10 pr-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Interactive Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = formData.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-2.5 rounded-xl text-left transition-all border flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-cyan-500/70 bg-cyan-500/10 shadow-glow-cyan'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">{r.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors">
              Sign In to account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

