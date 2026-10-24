import React from 'react';
import { MerchantProfile, Transaction } from '../types';
import { Store, ShieldAlert, ArrowLeft, Receipt, Percent } from 'lucide-react';

interface MerchantProfilePageProps {
  merchantId?: string;
  transactions: Transaction[];
  onSelectTransaction: (id: string) => void;
  onBack?: () => void;
}

export const MerchantProfilePage: React.FC<MerchantProfilePageProps> = ({
  merchantId = 'MRC-102',
  transactions,
  onSelectTransaction,
  onBack
}) => {
  const mTxns = transactions.filter(t => t.merchant === 'Apex Crypto Exchange' || t.merchant === 'XYZ Electronics');

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
              <h2 className="text-xl font-extrabold text-white">Apex Crypto Exchange</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                CRITICAL RISK BASELINE (91%)
              </span>
            </div>
            <p className="text-xs text-slate-400">Merchant Risk Profile & Chargeback Rate Diagnostics</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Merchant Profile</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Merchant ID</span>
              <span className="font-mono font-bold text-blue-400">MRC-102</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Category</span>
              <span className="text-slate-200">Financial Services</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Processing Volume</span>
              <span className="font-mono font-bold text-white">₹3,80,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Fraud Incident Rate</span>
              <span className="font-bold text-rose-400">8.5%</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Chargeback Rate</span>
              <span className="font-bold text-rose-400">4.2%</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <span>High-Risk Merchant Activity Log</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">TXN ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {mTxns.slice(0, 5).map(t => (
                  <tr key={t.transaction_id} className="hover:bg-slate-900">
                    <td className="p-3 font-mono font-bold text-blue-400">{t.transaction_id}</td>
                    <td className="p-3 text-slate-300">{t.customer_id}</td>
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
