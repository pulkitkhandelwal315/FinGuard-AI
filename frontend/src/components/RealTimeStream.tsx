import React, { useEffect, useState } from 'react';
import { Radio, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StreamEvent {
  transaction_id: string;
  amount: number;
  merchant: string;
  payment_method: string;
  risk_score: number;
  risk_level: string;
  flagged: boolean;
  timestamp: string;
}

export const RealTimeStream: React.FC = () => {
  const [events, setEvents] = useState<StreamEvent[]>([
    { transaction_id: 'TXN-82145', amount: 8200, merchant: 'Swiggy Food', payment_method: 'UPI', risk_score: 0.12, risk_level: 'LOW', flagged: false, timestamp: 'Just now' },
    { transaction_id: 'TXN-82146', amount: 42000, merchant: 'XYZ Electronics', payment_method: 'Credit Card', risk_score: 0.54, risk_level: 'MEDIUM', flagged: false, timestamp: 'Just now' },
    { transaction_id: 'TXN-82147', amount: 76000, merchant: 'Apex Crypto', payment_method: 'Bank Transfer', risk_score: 0.91, risk_level: 'HIGH', flagged: true, timestamp: 'Just now' },
    { transaction_id: 'TXN-82148', amount: 1200, merchant: 'Amazon India', payment_method: 'UPI', risk_score: 0.05, risk_level: 'LOW', flagged: false, timestamp: 'Just now' }
  ]);

  useEffect(() => {
    // Attempt WebSocket connection or simulated stream pulse
    const timer = setInterval(() => {
      const isHigh = Math.random() > 0.65;
      const amt = isHigh ? Math.floor(Math.random() * 60000 + 35000) : Math.floor(Math.random() * 5000 + 200);
      const newEvent: StreamEvent = {
        transaction_id: `TXN-${Math.floor(Math.random() * 10000 + 82150)}`,
        amount: amt,
        merchant: isHigh ? 'Apex Crypto Exchange' : 'Swiggy Food',
        payment_method: isHigh ? 'Bank Transfer' : 'UPI',
        risk_score: isHigh ? Number((Math.random() * 0.2 + 0.78).toFixed(2)) : Number((Math.random() * 0.15 + 0.02).toFixed(2)),
        risk_level: isHigh ? 'HIGH' : 'LOW',
        flagged: isHigh,
        timestamp: 'Just now'
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 7)]);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Stream Transaction Monitoring
          </h3>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
          WEBSOCKET ACTIVE
        </span>
      </div>

      <div className="space-y-2">
        {events.map((evt, idx) => (
          <div
            key={evt.transaction_id + idx}
            className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
              evt.flagged 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200 animate-in fade-in slide-in-from-top-1' 
                : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              {evt.flagged ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <div>
                <div className="font-mono font-bold">{evt.transaction_id}</div>
                <div className="text-[10px] text-slate-400">{evt.merchant} • {evt.payment_method}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono font-bold text-slate-100">₹{evt.amount.toLocaleString()}</div>
              <div className={`text-[10px] font-bold ${evt.flagged ? 'text-rose-400' : 'text-emerald-400'}`}>
                {evt.risk_level} ({Math.round(evt.risk_score * 100)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
