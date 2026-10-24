import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, Search, Bell, Database, UserCheck, ChevronDown, Check } from 'lucide-react';

interface NavbarProps {
  onReloadDemo: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReloadDemo, onOpenUpload }) => {
  const { user, setRole } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: UserRole[] = ['USER', 'FRAUD_ANALYST', 'ADMIN'];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3 flex items-center justify-between">
      {/* Left Title & Search */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              FinGuard AI
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Financial Intelligence Platform
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search TXN-ID, Merchant, Device..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls & Role Switcher */}
      <div className="flex items-center space-x-4">
        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all"
        >
          <span>Upload File</span>
        </button>

        {/* 1-Click Demo Button */}
        <button
          onClick={onReloadDemo}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Load Demo Data</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-white">Security Alerts (23)</span>
                <span className="text-[10px] text-blue-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs">
                  <div className="flex items-center justify-between text-red-400 font-medium">
                    <span>🔴 CRITICAL ALERT</span>
                    <span className="text-[10px] text-slate-400">2m ago</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1">₹85,000 transaction from unknown device DEV-NEW-9841</p>
                </div>
                <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs">
                  <div className="flex items-center justify-between text-orange-400 font-medium">
                    <span>🟠 HIGH RISK FLAG</span>
                    <span className="text-[10px] text-slate-400">12m ago</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1">Multiple transactions detected within 2 minutes</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
              {user?.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-slate-200 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-blue-400 font-medium">{user?.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Switch System Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${
                    user?.role === r ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{r}</span>
                  </div>
                  {user?.role === r && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
