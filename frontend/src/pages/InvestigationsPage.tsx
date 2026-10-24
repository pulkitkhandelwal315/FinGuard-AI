import React, { useState } from 'react';
import { InvestigationCase } from '../types';
import { FileSearch, Eye, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface InvestigationsPageProps {
  onSelectCase: (caseId: string) => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({ onSelectCase }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const cases: InvestigationCase[] = [
    {
      case_id: 'CASE-10231',
      transaction_id: 'TXN-94821',
      customer_id: 'CUST-1042',
      amount: 48250,
      merchant: 'XYZ Electronics',
      risk_score: 0.87,
      status: 'UNDER_INVESTIGATION',
      priority: 'HIGH',
      assigned_analyst: 'Admin',
      created_at: '2026-08-24 10:21',
      updated_at: '2026-08-24 10:31',
      timeline: [],
      notes: []
    },
    {
      case_id: 'CASE-10232',
      transaction_id: 'TXN-82147',
      customer_id: 'CUST-1088',
      amount: 76000,
      merchant: 'Apex Crypto Exchange',
      risk_score: 0.91,
      status: 'OPEN',
      priority: 'CRITICAL',
      assigned_analyst: 'Unassigned',
      created_at: '2026-08-24 11:05',
      updated_at: '2026-08-24 11:05',
      timeline: [],
      notes: []
    }
  ];

  const filtered = statusFilter === 'ALL' ? cases : cases.filter(c => c.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Fraud Investigation Workbench</h2>
          <p className="text-xs text-slate-400">Analyst case queue, evidence gathering, and decision auditing</p>
        </div>
      </div>

      {/* Case Status Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        {['ALL', 'OPEN', 'UNDER_INVESTIGATION', 'CLOSED_FRAUD', 'CLOSED_LEGITIMATE'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === st 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Cases Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Case ID</th>
                <th className="p-3.5">TXN ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Merchant</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Fraud Risk</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Analyst</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map(c => (
                <tr key={c.case_id} className="hover:bg-slate-900/60 transition-all">
                  <td className="p-3.5 font-mono font-bold text-blue-400">{c.case_id}</td>
                  <td className="p-3.5 font-mono text-slate-300">{c.transaction_id}</td>
                  <td className="p-3.5 text-slate-400">{c.customer_id}</td>
                  <td className="p-3.5 font-mono font-bold text-white">₹{c.amount.toLocaleString()}</td>
                  <td className="p-3.5 text-slate-200 font-semibold">{c.merchant}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {c.priority}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-rose-400">
                    {Math.round(c.risk_score * 100)}%
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 font-semibold">{c.assigned_analyst}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => onSelectCase(c.case_id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-1"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Open Case</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
