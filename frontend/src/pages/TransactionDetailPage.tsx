import React, { useState } from 'react';
import { Transaction, FeatureContribution } from '../types';
import { SHAPExplainerCard } from '../components/SHAPExplainerCard';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Laptop, 
  MapPin, 
  CreditCard, 
  User, 
  Store, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  FileSearch,
  Tag
} from 'lucide-react';

interface TransactionDetailPageProps {
  transactionId: string;
  transactions: Transaction[];
  onBack: () => void;
  onNavigateCustomer?: (id: string) => void;
  onNavigateMerchant?: (id: string) => void;
  onNavigateDevice?: (id: string) => void;
}

export const TransactionDetailPage: React.FC<TransactionDetailPageProps> = ({
  transactionId,
  transactions,
  onBack,
  onNavigateCustomer,
  onNavigateMerchant,
  onNavigateDevice
}) => {
  const txn = transactions.find(t => t.transaction_id.toUpperCase() === transactionId.toUpperCase()) || transactions[0];
  const [decision, setDecision] = useState<'NONE' | 'BLOCKED' | 'ALLOWED'>('NONE');

  const sampleContributions: FeatureContribution[] = [
    { feature_name: 'New Device Fingerprint', impact_percentage: 24, is_risk_increasing: true, description: 'First time transaction originated from this hardware device' },
    { feature_name: 'Transaction Amount Spike', impact_percentage: 21, is_risk_increasing: true, description: 'Amount (₹48,250) is 4.2x higher than historical average' },
    { feature_name: 'Location Anomaly', impact_percentage: 18, is_risk_increasing: true, description: 'Distance delta suggests impossible travel speed' },
    { feature_name: 'Velocity Pattern', impact_percentage: 15, is_risk_increasing: true, description: '3 high-value payments inside 5 minutes' },
    { feature_name: 'Merchant Category Risk', impact_percentage: 12, is_risk_increasing: true, description: 'Electronics/Luxury carries high baseline risk' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white font-mono">{txn.transaction_id}</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                CRITICAL RISK (90%)
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>Typology: Account Takeover</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Deep Fraud Diagnostics, Entity Navigation & Decision Action Workbench</p>
          </div>
        </div>

        {/* Operational Action Bar */}
        <div className="flex items-center space-x-2">
          {decision === 'NONE' ? (
            <>
              <button
                onClick={() => setDecision('BLOCKED')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>BLOCK TRANSACTION</span>
              </button>

              <button
                onClick={() => setDecision('ALLOWED')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ALLOW TRANSACTION</span>
              </button>
            </>
          ) : (
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              decision === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              ACTION ENFORCED: {decision}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Details + SHAP Explainer */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Transaction Metadata Cards */}
        <div className="space-y-6">
          {/* Linked Entity Links Card */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Linked Entity Risk Profiles
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800 items-center">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Customer ID</span>
                </span>
                <button
                  onClick={() => onNavigateCustomer && onNavigateCustomer(txn.customer_id)}
                  className="font-mono font-bold text-blue-400 hover:underline"
                >
                  {txn.customer_id} →
                </button>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800 items-center">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span>Merchant</span>
                </span>
                <button
                  onClick={() => onNavigateMerchant && onNavigateMerchant('MRC-102')}
                  className="font-semibold text-amber-400 hover:underline"
                >
                  {txn.merchant} →
                </button>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800 items-center">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-purple-400" />
                  <span>Device Fingerprint</span>
                </span>
                <button
                  onClick={() => onNavigateDevice && onNavigateDevice(txn.device_id)}
                  className="font-mono font-bold text-purple-400 hover:underline"
                >
                  {txn.device_id} →
                </button>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Location</span>
                </span>
                <span className="text-slate-300">{txn.location}</span>
              </div>
            </div>
          </div>

          {/* Model Risk Scores Breakdown */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ensemble Model Decisions
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                  <span>XGBoost Fraud Classifier</span>
                  <span className="font-mono font-bold text-rose-400">92%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                  <span>Isolation Forest Anomaly Score</span>
                  <span className="font-mono font-bold text-rose-400">81%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: '81%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                  <span>PyTorch LSTM Behavioral Model</span>
                  <span className="font-mono font-bold text-amber-400">88%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SHAP Waterfall & Why Flagged */}
        <div className="lg:col-span-2 space-y-6">
          {/* Why Was It Flagged Card */}
          <div className="glass-panel p-5 space-y-3 border-l-4 border-l-rose-500">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Why Was This Transaction Flagged?</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>New device fingerprint detected ({txn.device_id})</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>High transaction amount (₹{txn.amount.toLocaleString()})</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Unusual merchant category baseline</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Location anomaly suggesting impossible travel velocity</span>
              </div>
            </div>
          </div>

          {/* SHAP Explainer Waterfall Card */}
          <SHAPExplainerCard
            contributions={sampleContributions}
            explanationText="This transaction received an ensemble score of 90% due to combined signals: new hardware fingerprint + 4.2x amount escalation + spatial distance anomaly."
            fraudProbability={0.90}
          />
        </div>
      </div>
    </div>
  );
};
