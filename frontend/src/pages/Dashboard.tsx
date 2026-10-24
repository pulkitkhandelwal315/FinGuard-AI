import React, { useState } from 'react';
import { KPICard } from '../components/KPICard';
import { RealTimeStream } from '../components/RealTimeStream';
import { RiskPulseWidget } from '../components/RiskPulseWidget';
import { GeoFraudMap } from '../components/GeoFraudMap';
import { Transaction } from '../types';
import { 
  CreditCard, 
  Activity, 
  AlertTriangle, 
  Percent, 
  Bell, 
  ShieldAlert, 
  Eye, 
  Calendar,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  onSelectTransaction: (id: string) => void;
}

const chartData = [
  { month: 'Jan', volume: 32000, risk: 4 },
  { month: 'Feb', volume: 37000, risk: 6 },
  { month: 'Mar', volume: 41000, risk: 5 },
  { month: 'Apr', volume: 39000, risk: 8 },
  { month: 'May', volume: 45000, risk: 7 },
  { month: 'Jun', volume: 42000, risk: 9 },
  { month: 'Jul', volume: 48000, risk: 12 },
  { month: 'Aug', volume: 51000, risk: 14 }
];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onSelectTransaction }) => {
  const [timeRange, setTimeRange] = useState('30D');
  const [compareMode, setCompareMode] = useState('PREV_PERIOD');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Region filtering
  let filteredTxns = transactions;
  if (selectedRegion) {
    filteredTxns = filteredTxns.filter(t => t.location.toLowerCase().includes(selectedRegion.toLowerCase()));
  }

  const highRiskTxns = filteredTxns.filter(t => t.risk_level === 'HIGH' || t.risk_level === 'CRITICAL').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Analyst Command Center</h2>
          <p className="text-xs text-slate-400">Real-time financial telemetry, risk pulse metrics, and regional fraud intelligence</p>
        </div>

        {/* Time Range & Comparison Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            {['24H', '7D', '30D', '90D', '1Y'].map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  timeRange === tr ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

          <select
            value={compareMode}
            onChange={(e) => setCompareMode(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="PREV_PERIOD">Compare: Previous Period</option>
            <option value="PREV_YEAR">Compare: Previous Year</option>
          </select>
        </div>
      </div>

      {/* Operational Risk Pulse Widget */}
      <RiskPulseWidget />

      {/* Geographic Fraud Intelligence Region Map */}
      <GeoFraudMap selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Transactions"
          value="₹4,86,250"
          change="+12.4%"
          isPositive={true}
          period={compareMode === 'PREV_PERIOD' ? 'vs prev period' : 'vs prev year'}
          icon={CreditCard}
          colorTheme="blue"
        />
        <KPICard
          title="Analyzed"
          value="12,842"
          change="+8.1%"
          isPositive={true}
          period={compareMode === 'PREV_PERIOD' ? 'vs prev period' : 'vs prev year'}
          icon={Activity}
          colorTheme="indigo"
        />
        <KPICard
          title="Suspicious"
          value="184"
          change="-3.2%"
          isPositive={true}
          period="vs SLA target"
          icon={AlertTriangle}
          colorTheme="amber"
        />
        <KPICard
          title="Fraud Risk"
          value="6.8%"
          change="-0.5%"
          isPositive={true}
          period="vs threshold"
          icon={Percent}
          colorTheme="rose"
        />
        <KPICard
          title="Active Alerts"
          value="23"
          change="+2"
          isPositive={false}
          period="requires action"
          icon={Bell}
          colorTheme="rose"
        />
        <KPICard
          title="High-Risk Queue"
          value="17"
          change="-4"
          isPositive={true}
          period="in investigation"
          icon={ShieldAlert}
          colorTheme="amber"
        />
      </div>

      {/* Charts & Streaming Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Spending & Fraud Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Transaction Volume vs Risk Trajectory ({timeRange})
              </h3>
              <p className="text-[11px] text-slate-400">Comparing active portfolio against baseline risk tolerances</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-400">INR (₹)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#0066ff" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time WebSocket Stream */}
        <RealTimeStream />
      </div>

      {/* High-Risk Queue Table */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>High-Risk Suspicious Transactions Queue {selectedRegion && `(${selectedRegion})`}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">TXN ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Merchant</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Fraud Typology</th>
                <th className="p-3">Location</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Fraud %</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {highRiskTxns.map((t) => (
                <tr key={t.transaction_id} className="hover:bg-slate-900/60 transition-all">
                  <td className="p-3 font-mono font-bold text-blue-400">{t.transaction_id}</td>
                  <td className="p-3 text-slate-400">{t.timestamp.slice(0, 10)}</td>
                  <td className="p-3 text-slate-200 font-semibold">{t.merchant}</td>
                  <td className="p-3 font-mono font-bold text-white">₹{t.amount.toLocaleString()}</td>
                  <td className="p-3 font-mono text-purple-400 text-[11px]">{t.fraud_typology || 'Account Takeover'}</td>
                  <td className="p-3 text-slate-400">{t.location}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {t.risk_level}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-rose-400">
                    {Math.round((t.fraud_probability || 0.85) * 100)}%
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onSelectTransaction(t.transaction_id)}
                      className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
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
