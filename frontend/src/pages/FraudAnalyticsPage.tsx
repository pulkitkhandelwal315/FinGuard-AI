import React from 'react';
import { ShieldAlert, AlertTriangle, Activity, Percent, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fraudByCategory = [
  { category: 'Luxury', count: 48, percentage: 38 },
  { category: 'Financial', count: 36, percentage: 28 },
  { category: 'Travel', count: 24, percentage: 19 },
  { category: 'Electronics', count: 18, percentage: 15 }
];

export const FraudAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Fraud Analytics & Loss Prevention Metrics</h2>
          <p className="text-xs text-slate-400">Financial impact, model precision-recall SLAs, and fraud typology concentration</p>
        </div>
      </div>

      {/* Financial Prevention Impact Row */}
      <div className="glass-panel p-5 space-y-3 border-l-4 border-l-emerald-500">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Financial Fraud Prevention & Loss Avoidance</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-semibold">Fraud Detected</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">₹24.8L</div>
            <div className="text-[9px] text-slate-500">Total flagged volume</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center">
            <div className="text-[10px] text-emerald-400 font-semibold">Fraud Blocked</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">₹18.2L</div>
            <div className="text-[9px] text-emerald-400/80 font-medium">Prevented financial loss</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-center">
            <div className="text-[10px] text-amber-400 font-semibold">Potential Exposure</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">₹6.6L</div>
            <div className="text-[9px] text-slate-500">Under analyst review</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 text-center">
            <div className="text-[10px] text-purple-400 font-semibold">Recovered Capital</div>
            <div className="text-xl font-bold font-mono text-purple-300 mt-0.5">₹3.4L</div>
            <div className="text-[9px] text-slate-500">Chargeback disputes</div>
          </div>
        </div>
      </div>

      {/* Model Performance SLA KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card text-center space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold">Fraud Rate</div>
          <div className="text-2xl font-bold font-mono text-rose-400">1.82%</div>
          <div className="text-[10px] text-emerald-400 font-medium">-0.14% vs last week</div>
        </div>

        <div className="glass-card text-center space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold">Detection Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">94.1%</div>
          <div className="text-[10px] text-emerald-400 font-medium">+1.2% model recall</div>
        </div>

        <div className="glass-card text-center space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold">False Positive Rate</div>
          <div className="text-2xl font-bold font-mono text-amber-400">4.7%</div>
          <div className="text-[10px] text-emerald-400 font-medium">Within 5% target SLA</div>
        </div>

        <div className="glass-card text-center space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold">Avg Risk Score</div>
          <div className="text-2xl font-bold font-mono text-blue-400">38.2%</div>
          <div className="text-[10px] text-slate-400 font-medium">Portfolio mean</div>
        </div>

        <div className="glass-card text-center space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold">Critical Alerts</div>
          <div className="text-2xl font-bold font-mono text-rose-400">24</div>
          <div className="text-[10px] text-rose-400 font-medium">Requires investigation</div>
        </div>
      </div>

      {/* Fraud Concentration Chart */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Fraud Incident Concentration by Category</span>
          </h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fraudByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
