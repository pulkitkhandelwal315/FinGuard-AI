import React, { useState, useEffect } from 'react';
import { Alert, RiskLevel } from '../types';
import { Bell, ShieldAlert, Eye, CheckCircle, XCircle, FileSearch, Clock, UserCheck, ShieldOff } from 'lucide-react';

interface AlertsPageProps {
  onSelectTransaction: (id: string) => void;
  onOpenCase: (txnId: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  onSelectTransaction,
  onOpenCase
}) => {
  const [selectedSev, setSelectedSev] = useState<string>('ALL');
  const [slaTime, setSlaTime] = useState(1122); // 18m 42s in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setSlaTime(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSLA = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`;
  };

  const mockAlerts: (Alert & { slaSeconds: number; assignedTo: string; lifecycle: string })[] = [
    { id: 'ALT-5001', transaction_id: 'TXN-94821', account_id: 'ACC-5042', customer_id: 'CUST-1042', amount: 48250, merchant: 'XYZ Electronics', severity: 'HIGH', title: 'High-risk transaction from new device', description: 'Transaction of ₹48,250 from unrecognized device DEV-NEW-9841 received a fraud probability of 87%.', status: 'UNRESOLVED', created_at: '10:21 AM', slaSeconds: slaTime, assignedTo: 'Admin', lifecycle: 'UNDER_INVESTIGATION' },
    { id: 'ALT-5002', transaction_id: 'TXN-82147', account_id: 'ACC-5088', customer_id: 'CUST-1088', amount: 76000, merchant: 'Apex Crypto Exchange', severity: 'CRITICAL', title: 'Critical anomaly & impossible travel speed', description: 'Overnight foreign IP payment location change from Mumbai to London within 10 minutes interval.', status: 'UNRESOLVED', created_at: '11:05 AM', slaSeconds: 420, assignedTo: 'Unassigned', lifecycle: 'NEW' },
    { id: 'ALT-5003', transaction_id: 'TXN-94815', account_id: 'ACC-5012', customer_id: 'CUST-1012', amount: 12000, merchant: 'Swiggy Food', severity: 'MEDIUM', title: 'Multiple transactions within 2 minutes', description: 'Rapid velocity burst detected (4 requests inside 120 seconds).', status: 'UNRESOLVED', created_at: '11:30 AM', slaSeconds: 2400, assignedTo: 'Analyst Admin', lifecycle: 'ACKNOWLEDGED' }
  ];

  const filtered = selectedSev === 'ALL' ? mockAlerts : mockAlerts.filter(a => a.severity === selectedSev);

  const getSeverityBadge = (sev: RiskLevel) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Alert Operations & Lifecycle Center</h2>
          <p className="text-xs text-slate-400">Prioritized SLA alerts queue with live countdown timers and workflow assignment</p>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
          <button
            key={sev}
            onClick={() => setSelectedSev(sev)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedSev === sev 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {sev === 'CRITICAL' && '🔴 '}
            {sev === 'HIGH' && '🟠 '}
            {sev === 'MEDIUM' && '🟡 '}
            {sev === 'LOW' && '🔵 '}
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filtered.map(alert => (
          <div key={alert.id} className="glass-panel p-5 space-y-3 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="font-mono font-bold text-slate-200 text-xs">{alert.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                  {alert.lifecycle}
                </span>
              </div>

              {/* SLA Countdown Badge */}
              <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>SLA: {formatSLA(alert.slaSeconds)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400 font-mono">
                TXN: <span className="text-blue-400 font-bold">{alert.transaction_id}</span> • Assigned: <span className="text-slate-200 font-semibold">{alert.assignedTo}</span>
              </div>

              {/* Action Workflow Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => onSelectTransaction(alert.transaction_id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => onOpenCase(alert.transaction_id)}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-1 shadow-sm"
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Investigate</span>
                </button>

                <button className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all">
                  Resolve
                </button>

                <button className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
                  Suppress
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
