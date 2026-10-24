import React from 'react';
import { DeviceProfile, Transaction } from '../types';
import { Laptop, ShieldAlert, ArrowLeft, Globe, Users } from 'lucide-react';

interface DeviceProfilePageProps {
  deviceId?: string;
  transactions: Transaction[];
  onSelectTransaction: (id: string) => void;
  onBack?: () => void;
}

export const DeviceProfilePage: React.FC<DeviceProfilePageProps> = ({
  deviceId = 'DEV-NEW-9841',
  transactions,
  onSelectTransaction,
  onBack
}) => {
  const dTxns = transactions.filter(t => t.device_id === deviceId || t.risk_level === 'CRITICAL');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white font-mono">{deviceId}</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                UNRECOGNIZED HARDWARE FINGERPRINT (89%)
              </span>
            </div>
            <p className="text-xs text-slate-400">Device Telemetry, Velocity & Linked Customer Accounts</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hardware Telemetry</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Fingerprint ID</span>
              <span className="font-mono font-bold text-purple-400">{deviceId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">OS / Browser</span>
              <span className="text-slate-200">Chrome 122 / Linux</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Velocity Score</span>
              <span className="font-bold text-rose-400">8.2 / 10</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Linked Accounts</span>
              <span className="font-mono text-blue-400">3 Accounts</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Known IP Addresses</span>
              <span className="font-mono text-slate-300">185.220.101.5</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Laptop className="w-4 h-4 text-purple-400" />
            <span>Device Activity Stream</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">TXN ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Merchant</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {dTxns.slice(0, 5).map(t => (
                  <tr key={t.transaction_id} className="hover:bg-slate-900">
                    <td className="p-3 font-mono font-bold text-blue-400">{t.transaction_id}</td>
                    <td className="p-3 text-slate-300">{t.customer_id}</td>
                    <td className="p-3 text-slate-300">{t.merchant}</td>
                    <td className="p-3 font-mono font-bold text-white">₹{t.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                        {t.risk_level}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onSelectTransaction(t.transaction_id)}
                        className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
