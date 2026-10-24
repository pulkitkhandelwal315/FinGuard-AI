import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  ShieldAlert, 
  Bell, 
  FileSearch, 
  Bot, 
  Cpu, 
  Sliders, 
  Settings, 
  Home, 
  LogOut,
  Users,
  Store,
  Laptop,
  FileCheck2
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const navGroups = [
    {
      group: 'MONITOR',
      items: [
        { label: 'Overview Landing', path: '/', icon: Home },
        { label: 'Command Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Alert Center', path: '/alerts', icon: Bell, badge: '23' }
      ]
    },
    {
      group: 'ANALYZE',
      items: [
        { label: 'Transactions Ledger', path: '/transactions', icon: Receipt },
        { label: 'Financial Analytics', path: '/analytics', icon: PieChart },
        { label: 'Fraud Detection Metrics', path: '/fraud', icon: ShieldAlert },
        { label: 'Customer Risk Profiles', path: '/customers', icon: Users },
        { label: 'Merchant Risk Profiles', path: '/merchants', icon: Store },
        { label: 'Device Risk Profiles', path: '/devices', icon: Laptop }
      ]
    },
    {
      group: 'INVESTIGATE',
      items: [
        { label: 'Cases Workbench', path: '/investigations', icon: FileSearch, badge: '10' }
      ]
    },
    {
      group: 'AI & MODELS',
      items: [
        { label: 'AI Assistant Workspace', path: '/assistant', icon: Bot },
        { label: 'Models & MLOps Drift', path: '/models', icon: Cpu }
      ]
    },
    {
      group: 'ADMIN',
      items: [
        { label: 'Rule Engine & Builder', path: '/admin', icon: Sliders },
        { label: 'Audit & Activity Logs', path: '/audit-logs', icon: FileCheck2 },
        { label: 'Settings & Security', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between min-h-[calc(100vh-61px)] p-3">
      <div className="space-y-4">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {group.group}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Session Badge */}
      <div className="border-t border-slate-800/80 pt-3 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/60 text-xs">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Active User</div>
          <div className="font-semibold text-slate-300 truncate">{user?.name}</div>
          <div className="text-[9px] text-blue-400 font-mono mt-0.5">{user?.role} ROLE</div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
