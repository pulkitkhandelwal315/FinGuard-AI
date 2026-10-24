import React, { useState } from 'react';
import { NetworkGraph } from '../components/NetworkGraph';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, XCircle, AlertOctagon, Send } from 'lucide-react';

interface InvestigationDetailPageProps {
  caseId: string;
  onBack: () => void;
}

export const InvestigationDetailPage: React.FC<InvestigationDetailPageProps> = ({ caseId, onBack }) => {
  const [status, setStatus] = useState('UNDER_INVESTIGATION');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([
    { id: '1', author: 'Analyst Admin', text: 'Customer confirmed device change in progress. Awaiting OTP log verification.', time: '10:30 AM' }
  ]);

  const timeline = [
    { time: '10:21 AM', title: 'Transaction initiated', desc: '₹48,250 transaction attempted at XYZ Electronics' },
    { time: '10:21 AM', title: 'New device detected', desc: 'Unrecognized hardware fingerprint DEV-NEW-9841' },
    { time: '10:21 AM', title: 'Risk score generated', desc: 'Ensemble ML model computed 87% fraud risk score' },
    { time: '10:22 AM', title: 'Alert generated', desc: 'CRITICAL alert routed to Fraud Monitoring Center' },
    { time: '10:24 AM', title: 'Analyst opened case', desc: 'Assigned to Senior Analyst Admin' },
    { time: '10:31 AM', title: 'Marked suspicious', desc: 'Investigator flagged for secondary authentication check' }
  ];

  const nodes = [
    { id: 'TXN-94821', label: 'TXN-94821', type: 'TRANSACTION' as const, risk_level: 'HIGH' as const },
    { id: 'CUST-1042', label: 'CUST-1042', type: 'CUSTOMER' as const, risk_level: 'LOW' as const },
    { id: 'DEV-NEW-9841', label: 'DEV-NEW-9841', type: 'DEVICE' as const, risk_level: 'HIGH' as const },
    { id: '185.220.101.5', label: '185.220.101.5', type: 'IP' as const, risk_level: 'CRITICAL' as const },
    { id: 'XYZ Electronics', label: 'XYZ Electronics', type: 'MERCHANT' as const, risk_level: 'MEDIUM' as const }
  ];

  const edges = [
    { source: 'TXN-94821', target: 'CUST-1042', relationship: 'Same Account' },
    { source: 'TXN-94821', target: 'DEV-NEW-9841', relationship: 'Same Device' },
    { source: 'TXN-94821', target: '185.220.101.5', relationship: 'Same IP' },
    { source: 'TXN-94821', target: 'XYZ Electronics', relationship: 'Merchant' }
  ];

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [...prev, { id: Date.now().toString(), author: 'Analyst Admin', text: noteText, time: 'Just now' }]);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white font-mono">{caseId}</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">Transaction ID: TXN-94821 • Customer: CUST-1042</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatus('CLOSED_FRAUD')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Mark Fraud</span>
          </button>

          <button
            onClick={() => setStatus('CLOSED_LEGITIMATE')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mark Legitimate</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline & Analyst Notes */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Investigation Chronological Timeline</span>
            </h3>

            <div className="relative border-l-2 border-slate-800 ml-2 space-y-4 pl-4 text-xs">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-slate-950" />
                  <div className="font-mono text-[10px] text-blue-400 font-semibold">{item.time}</div>
                  <div className="font-bold text-slate-200">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst Notes Log */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Analyst Case Notes & Evidence Log
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes.map(n => (
                <div key={n.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-medium text-[10px]">
                    <span>{n.author}</span>
                    <span>{n.time}</span>
                  </div>
                  <p className="text-slate-200 text-[11px] mt-1">{n.text}</p>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-2">
              <input
                type="text"
                placeholder="Add investigation evidence note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddNote}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Related Transaction Entity Graph */}
        <div className="lg:col-span-2 space-y-6">
          <NetworkGraph nodes={nodes} edges={edges} />
        </div>
      </div>
    </div>
  );
};
