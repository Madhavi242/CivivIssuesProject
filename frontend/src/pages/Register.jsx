import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Key, User, Phone, Landmark, ArrowRight, Wrench, Building2, ShieldCheck } from 'lucide-react';
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
    { id: 'citizen', label: 'Citizen', icon: User, desc: 'Report & verify issues' },
    { id: 'field_worker', label: 'Field Tech', icon: Wrench, desc: 'Resolve tasks in field' },
    { id: 'department_admin', label: 'Dept Admin', icon: Building2, desc: 'Triage & assign crews' },
    { id: 'system_admin', label: 'Sys Admin', icon: ShieldCheck, desc: 'Platform governance' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-xs mb-3">
            <Landmark className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Register on CivicPulse to report and track municipal complaints
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Patel"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@example.com"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Type
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
                      className={`p-2.5 rounded-lg text-left transition-colors border flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-1 rounded ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight">{r.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs py-2.5 rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
            Already registered?{' '}
            <Link to="/login" className="text-blue-700 hover:text-blue-800 font-semibold ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
