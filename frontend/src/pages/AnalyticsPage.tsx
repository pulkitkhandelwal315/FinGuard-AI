import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { PieChart, TrendingUp, CreditCard, Store } from 'lucide-react';

const categoryData = [
  { name: 'Shopping', value: 145000, color: '#0066ff' },
  { name: 'Travel', value: 98000, color: '#8b5cf6' },
  { name: 'Food', value: 45000, color: '#10b981' },
  { name: 'Entertainment', value: 32000, color: '#f59e0b' },
  { name: 'Bills', value: 64000, color: '#06b6d4' },
  { name: 'Other', value: 28000, color: '#64748b' }
];

const paymentData = [
  { name: 'UPI', count: 4200 },
  { name: 'Credit Card', count: 3800 },
  { name: 'Debit Card', count: 2400 },
  { name: 'Bank Transfer', count: 1800 },
  { name: 'Cash', count: 642 }
];

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Financial Analytics Intelligence</h2>
          <p className="text-xs text-slate-400">Spending category breakdown, monthly trends, and payment method distribution</p>
        </div>
      </div>

      {/* Grid: Category Pie + Payment Bar */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Spending Pie Chart */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Spending Breakdown by Category</span>
            </h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Volume']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-300 font-medium">{c.name}:</span>
                <span className="text-slate-400 font-mono">₹{(c.value / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Bar Chart */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Transaction Volume by Payment Method</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
