import React, { useState } from 'react';
import { Cpu, Activity, Sliders, CheckCircle, AlertTriangle, RefreshCw, BarChart2, ShieldCheck, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const prCurveData = [
  { recall: 0.10, precision: 0.98 },
  { recall: 0.30, precision: 0.95 },
  { recall: 0.50, precision: 0.92 },
  { recall: 0.70, precision: 0.89 },
  { recall: 0.86, precision: 0.87 },
  { recall: 0.95, precision: 0.74 },
  { recall: 1.00, precision: 0.52 }
];

const driftTimelineData = [
  { day: 'Mon', dataDrift: 0.12, featureDrift: 0.15, predDrift: 0.10 },
  { day: 'Tue', dataDrift: 0.14, featureDrift: 0.18, predDrift: 0.12 },
  { day: 'Wed', dataDrift: 0.22, featureDrift: 0.25, predDrift: 0.19 },
  { day: 'Thu', dataDrift: 0.19, featureDrift: 0.21, predDrift: 0.16 },
  { day: 'Fri', dataDrift: 0.25, featureDrift: 0.30, predDrift: 0.22 }
];

export const MLOpsPage: React.FC = () => {
  const [highRiskThreshold, setHighRiskThreshold] = useState(0.80);
  const [medRiskThreshold, setMedRiskThreshold] = useState(0.60);
  const [lowRiskThreshold, setLowRiskThreshold] = useState(0.30);

  const [showApprovalModal, setShowApprovalModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">MLOps Telemetry & Model Drift Workspace</h2>
          <p className="text-xs text-slate-400">Track data/prediction drift over time, evaluate PR-AUC curves, and request threshold MFA approvals</p>
        </div>
      </div>

      {/* Model Health Status Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 space-y-3 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">XGBoost Classifier v4</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              HEALTHY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div><span className="text-slate-500">Precision:</span> <span className="text-white font-bold">0.89</span></div>
            <div><span className="text-slate-500">Recall:</span> <span className="text-white font-bold">0.86</span></div>
            <div><span className="text-slate-500">F1 Score:</span> <span className="text-white font-bold">0.87</span></div>
            <div><span className="text-slate-500">PR-AUC:</span> <span className="text-white font-bold">0.92</span></div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
            <span>Latency: 84.2 ms</span>
            <span>Last Retrained: 3 days ago</span>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-3 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Isolation Forest Anomaly v2</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              HEALTHY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div><span className="text-slate-500">Precision:</span> <span className="text-white font-bold">0.84</span></div>
            <div><span className="text-slate-500">Recall:</span> <span className="text-white font-bold">0.81</span></div>
            <div><span className="text-slate-500">F1 Score:</span> <span className="text-white font-bold">0.82</span></div>
            <div><span className="text-slate-500">PR-AUC:</span> <span className="text-white font-bold">0.88</span></div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
            <span>Latency: 32.5 ms</span>
            <span>Last Retrained: 5 days ago</span>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-3 border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">PyTorch LSTM Sequence v3</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              HEALTHY
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div><span className="text-slate-500">Precision:</span> <span className="text-white font-bold">0.86</span></div>
            <div><span className="text-slate-500">Recall:</span> <span className="text-white font-bold">0.83</span></div>
            <div><span className="text-slate-500">F1 Score:</span> <span className="text-white font-bold">0.84</span></div>
            <div><span className="text-slate-500">PR-AUC:</span> <span className="text-white font-bold">0.89</span></div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
            <span>Latency: 112.0 ms</span>
            <span>Last Retrained: 7 days ago</span>
          </div>
        </div>
      </div>

      {/* Model Drift Monitoring Timeline Chart */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Model Drift Telemetry (Data / Feature / Prediction Drift)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Drift Index &lt; 0.35 Target</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={driftTimelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 0.5]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="featureDrift" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Feature Drift" />
              <Area type="monotone" dataKey="dataDrift" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} name="Data Drift" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threshold Manager & Precision-Recall Curve */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dynamic Risk Threshold Management */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Fraud Thresholds & Impact Preview</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-400">Low Risk Threshold</span>
                <span className="font-mono text-white">&lt; {lowRiskThreshold * 100}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.40"
                step="0.05"
                value={lowRiskThreshold}
                onChange={(e) => setLowRiskThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-rose-400">High / Critical Risk Cutoff</span>
                <span className="font-mono text-white">&gt; {(highRiskThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.90"
                step="0.05"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <button
              onClick={() => setShowApprovalModal(true)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              Submit Threshold Changes for MFA Approval
            </button>
          </div>
        </div>

        {/* PR-AUC Curve Chart */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Precision-Recall Curve (PR-AUC: 0.92)</span>
            </h3>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="recall" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="precision" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Threshold Impact Estimator Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Threshold Change Expected Operational Impact</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between"><span className="text-slate-400">Current Threshold:</span> <span className="text-white">80%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Proposed Threshold:</span> <span className="text-blue-400 font-bold">{(highRiskThreshold * 100).toFixed(0)}%</span></div>
              <div className="border-t border-slate-800 pt-2 flex justify-between"><span className="text-slate-400">False Positive Rate:</span> <span className="text-emerald-400">-8%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Fraud Detection Recall:</span> <span className="text-amber-400">-2%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Blocked Volume Shift:</span> <span className="text-purple-400">+14%</span></div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
              >
                Submit MFA Approval Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
