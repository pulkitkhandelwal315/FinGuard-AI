import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface TransactionsPageProps {
  transactions: Transaction[];
  onSelectTransaction: (id: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onSelectTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Combinable Filtering logic
  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRisk === 'ALL' || t.risk_level === selectedRisk;
    const matchesCategory = selectedCategory === 'ALL' || t.merchant_category === selectedCategory;
    const matchesPayment = selectedPayment === 'ALL' || t.payment_method === selectedPayment;

    return matchesSearch && matchesRisk && matchesCategory && matchesPayment;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedTxns = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categories = ['ALL', 'Shopping', 'Food', 'Travel', 'Financial Services', 'Luxury', 'Bills', 'Entertainment'];
  const riskLevels = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const paymentMethods = ['ALL', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Transaction Intelligence Ledger</h2>
          <p className="text-xs text-slate-400">Search, filter, and inspect risk scoring across transaction history</p>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white">
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Combinable Filter Bar */}
      <div className="glass-panel p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by TXN ID, Merchant, Location..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Risk Level: All</option>
            {riskLevels.filter(r => r !== 'ALL').map(r => (
              <option key={r} value={r}>Risk: {r}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Category: All</option>
            {categories.filter(c => c !== 'ALL').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedPayment}
            onChange={(e) => { setSelectedPayment(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Payment Method: All</option>
            {paymentMethods.filter(p => p !== 'ALL').map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Merchant</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Fraud %</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {paginatedTxns.map((t) => {
                const isHigh = t.risk_level === 'HIGH' || t.risk_level === 'CRITICAL';
                return (
                  <tr key={t.transaction_id} className="hover:bg-slate-900/60 transition-all">
                    <td className="p-3.5 font-mono font-bold text-blue-400">{t.transaction_id}</td>
                    <td className="p-3.5 text-slate-400">{t.timestamp.replace('T', ' ').slice(0, 16)}</td>
                    <td className="p-3.5 text-slate-200 font-semibold">{t.merchant}</td>
                    <td className="p-3.5 font-mono font-bold text-white">₹{t.amount.toLocaleString()}</td>
                    <td className="p-3.5 text-slate-400">{t.merchant_category}</td>
                    <td className="p-3.5 text-slate-400">{t.location}</td>
                    <td className="p-3.5 text-slate-400">{t.payment_method}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isHigh 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                          : t.risk_level === 'MEDIUM' 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {t.risk_level}
                      </span>
                    </td>
                    <td className={`p-3.5 font-mono font-bold ${isHigh ? 'text-rose-400' : 'text-slate-300'}`}>
                      {Math.round((t.fraud_probability || 0.05) * 100)}%
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => onSelectTransaction(t.transaction_id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-semibold">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
            <span className="text-white font-semibold">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
            <span className="text-white font-semibold">{filtered.length}</span> transactions
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
