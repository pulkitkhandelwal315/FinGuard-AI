import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  icon: LucideIcon;
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  isPositive,
  period,
  icon: Icon,
  colorTheme = 'blue'
}) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30',
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/30',
  };

  return (
    <div className="glass-card flex flex-col justify-between space-y-3 relative overflow-hidden group hover:scale-[1.01] transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <div className={`p-2 rounded-xl bg-gradient-to-br border ${colorMap[colorTheme]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
        <div className="flex items-center space-x-2 mt-1 text-[11px]">
          <span className={`flex items-center font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
          <span className="text-slate-500">{period}</span>
        </div>
      </div>

      {/* Mini Trend Graph Visual Overlay */}
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${
            colorTheme === 'rose' ? 'from-rose-500 to-red-400' :
            colorTheme === 'amber' ? 'from-amber-500 to-orange-400' : 'from-blue-500 to-indigo-400'
          }`}
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      </div>
    </div>
  );
};
