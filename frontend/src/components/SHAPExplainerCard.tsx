import React from 'react';
import { FeatureContribution } from '../types';
import { ShieldAlert, Info } from 'lucide-react';

interface SHAPExplainerCardProps {
  contributions: FeatureContribution[];
  explanationText: string;
  fraudProbability: number;
}

export const SHAPExplainerCard: React.FC<SHAPExplainerCardProps> = ({
  contributions,
  explanationText,
  fraudProbability
}) => {
  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>Explainable AI Risk Breakdown (SHAP Analysis)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantified feature impacts contributing to the overall ensemble fraud score
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Estimated Fraud Risk</div>
          <div className="text-xl font-extrabold font-mono text-rose-400">
            {int(fraudProbability * 100)}%
          </div>
        </div>
      </div>

      {/* Human Readable Explanation */}
      <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-start space-x-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">{explanationText}</div>
      </div>

      {/* Feature Impact Bar Chart Waterfall */}
      <div className="space-y-3.5">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Top Risk Factors
        </div>

        {contributions.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-200 flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${item.is_risk_increasing ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span>{item.feature_name}</span>
              </span>
              <span className={`font-mono font-bold ${item.is_risk_increasing ? 'text-rose-400' : 'text-emerald-400'}`}>
                {item.is_risk_increasing ? '+' : '-'}{item.impact_percentage}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.is_risk_increasing 
                    ? 'bg-gradient-to-r from-rose-600 to-red-500' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                }`}
                style={{ width: `${Math.min(item.impact_percentage * 2.5, 100)}%` }}
              />
            </div>
            
            <p className="text-[11px] text-slate-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

function int(val: number): number {
  return Math.round(val);
}
