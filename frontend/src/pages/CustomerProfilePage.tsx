import React, { useState, useEffect } from 'react';
import { CustomerProfile, Transaction } from '../types';
import { Users, ShieldAlert, ArrowLeft, Laptop, MapPin, Receipt, ShieldCheck, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CustomerProfilePageProps {
  customerId?: string;
  transactions: Transaction[];
  onSelectTransaction: (id: string) => void;
  onBack?: () => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  customerId = 'CUST-1042',
  transactions,
  onSelectTransaction,
  onBack
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [piiMasked, setPiiMasked] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/entities/customers/${customerId}`, {
          headers: {
            'X-User-Role': user?.role || 'FRAUD_ANALYST',
            'X-User-Name': user?.name || 'Analyst'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.customer);
          setPiiMasked(Boolean(data.pii_masked));
        }
      } catch (e) {
        console.error('Error fetching customer:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, user?.role]);

  const custTxns = transactions.filter(t => t.customer_id === customerId);
  const riskPct = profile ? Math.round(profile.risk_score * 100) : 78;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white font-mono">{customerId}</h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                riskPct >= 60 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {riskPct >= 60 ? `HIGH RISK PROFILE (${riskPct}%)` : `LOW RISK PROFILE (${riskPct}%)`}
              </span>

              {/* RBAC PII Masking Indicator */}
              <span className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                piiMasked
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
              }`}>
                {piiMasked ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-emerald-400" />}
                <span>{piiMasked ? 'PII MASKED (ANALYST)' : 'PII UNMASKED (PRIVILEGED)'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Customer Identity, Linked Devices & Transaction History</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Overview</h3>
            <span className="text-[10px] text-slate-500 font-mono">SQLite Relational Record</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Customer ID</span>
              <span className="font-mono font-bold text-blue-400">{customerId}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Full Name</span>
              <span className="font-semibold text-slate-200">{profile?.name || 'Aarav Sharma'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Email Address</span>
              <span className="font-mono text-slate-200">{profile?.email || 'a***@example.com'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Phone Number</span>
              <span className="font-mono text-slate-200">{profile?.phone || '+91-98***-***10'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Lifetime Volume</span>
              <span className="font-mono font-bold text-white">
                ₹{(profile?.total_volume_inr || 482500).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Fraud Alerts</span>
              <span className="font-bold text-rose-400">{profile?.fraud_alert_count || 3} Flags</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5" />
                <span>Linked Devices</span>
              </span>
              <span className="font-mono text-cyan-400">
                {profile?.linked_devices?.length ? profile.linked_devices.join(', ') : 'DEV-101'}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Known Locations</span>
              </span>
              <span className="text-slate-300">
                {profile?.known_locations?.length ? profile.known_locations.join(', ') : 'Delhi, London'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Customer Transactions */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>Customer Transaction History</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">TXN ID</th>
                  <th className="p-3">Merchant</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {(custTxns.length > 0 ? custTxns : transactions).slice(0, 6).map(t => (
                  <tr key={t.transaction_id} className="hover:bg-slate-900 transition">
                    <td className="p-3 font-mono font-bold text-blue-400">{t.transaction_id}</td>
                    <td className="p-3 text-slate-200">{t.merchant}</td>
                    <td className="p-3 font-mono font-bold text-white">₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.risk_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        t.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {t.risk_level}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onSelectTransaction(t.transaction_id)}
                        className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[11px] font-semibold transition"
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
