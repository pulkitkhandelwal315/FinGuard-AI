import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Lock, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { setRole } = useAuth();
  const [email, setEmail] = useState('admin@finguard.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRoleState] = useState<UserRole>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(role);
    onLoginSuccess();
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 mx-auto shadow-xl shadow-blue-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Sign In to FinGuard AI</h2>
        <p className="text-xs text-slate-400">Financial Intelligence & Fraud Detection Workbench</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRoleState(e.target.value as UserRole)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ADMIN">ADMIN (Full Access)</option>
            <option value="FRAUD_ANALYST">FRAUD_ANALYST (Investigations)</option>
            <option value="USER">USER (Personal Portfolio)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
        >
          <span>Sign In to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
