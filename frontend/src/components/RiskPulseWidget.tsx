import React from 'react';
import { AlertCircle, ShieldAlert, ShieldX, DollarSign, Activity } from 'lucide-react';

export const RiskPulseWidget: React.FC = () => {
  return (
    <div className="glass-panel p-5 space-y-4 border-l-4 border-l-rose-500">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Operational Risk Pulse (Immediate Attention)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          REAL-TIME TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-red-500/30 text-center">
          <div className="text-[10px] text-red-400 font-semibold uppercase">Critical</div>
          <div className="text-xl font-bold font-mono text-red-400 mt-0.5">5</div>
          <div className="text-[9px] text-slate-500">Requires SLA response</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-orange-500/30 text-center">
          <div className="text-[10px] text-orange-400 font-semibold uppercase">High</div>
          <div className="text-xl font-bold font-mono text-orange-400 mt-0.5">12</div>
          <div className="text-[9px] text-slate-500">In investigation</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-center">
          <div className="text-[10px] text-amber-400 font-semibold uppercase">Medium</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">47</div>
          <div className="text-[9px] text-slate-500">Velocity monitored</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase">Low</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">120</div>
          <div className="text-[9px] text-slate-500">Authorized baseline</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-500/30 text-center">
          <div className="text-[10px] text-blue-400 font-semibold uppercase">Blocked Today</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">18</div>
          <div className="text-[9px] text-slate-500">Auto-enforced</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 text-center">
          <div className="text-[10px] text-purple-400 font-semibold uppercase">Amount at Risk</div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-0.5">₹18.4L</div>
          <div className="text-[9px] text-slate-500">Shielded volume</div>
        </div>
      </div>
    </div>
  );
};
