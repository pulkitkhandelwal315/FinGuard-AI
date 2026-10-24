import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Loader2, Download, Database, ShieldAlert, AlertTriangle } from 'lucide-react';

interface UploadReport {
  total_rows: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
  fraud_flagged_count: number;
  fraud_rate_percentage: number;
  errors?: { row: number; reason: string }[];
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTxns?: any[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<'IDLE' | 'PIPELINE' | 'COMPLETE'>('IDLE');
  const [pipelinePhase, setPipelinePhase] = useState<string>('Validating Schema...');
  const [report, setReport] = useState<UploadReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUploadFile = async (file: File) => {
    setFileName(file.name);
    setErrorMessage(null);
    setStep('PIPELINE');
    setPipelinePhase('Uploading & Parsing File...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => setPipelinePhase('Extracting Behavioral & Spatial Features...'), 400);
      setTimeout(() => setPipelinePhase('Evaluating Ensemble ML Models (XGBoost, Isolation Forest, LSTM)...'), 800);

      const res = await fetch('/api/transactions/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      setReport(data.report);
      setStep('COMPLETE');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process transaction file.');
      setStep('IDLE');
    }
  };

  const handleLoadBenchmark = async () => {
    setFileName('real_upi_banking_transactions.csv & fraud_attack_scenarios.csv');
    setErrorMessage(null);
    setStep('PIPELINE');
    setPipelinePhase('Loading Real UPI & Fraud Benchmark Datasets...');

    try {
      setTimeout(() => setPipelinePhase('Extracting Haversine Distances & Velocity Sequences...'), 400);
      setTimeout(() => setPipelinePhase('Running Supervised & Unsupervised ML Pipeline...'), 800);

      const res = await fetch('/api/transactions/load-benchmark', {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to load benchmark dataset');
      }

      const data = await res.json();
      setReport(data.report);
      setStep('COMPLETE');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load benchmark data.');
      setStep('IDLE');
    }
  };

  const handleDownloadSample = () => {
    window.open('/api/transactions/download-sample', '_blank');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleClose = () => {
    setStep('IDLE');
    setReport(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Data Ingestion & Scoring</h3>
              <p className="text-[11px] text-slate-400">Upload custom CSV / JSON or load real benchmark transaction datasets</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Upload Error: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.json,.xlsx"
          className="hidden"
        />

        {step === 'IDLE' ? (
          <div className="space-y-4">
            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-7 text-center transition-all cursor-pointer ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-200">Drag & drop your real financial transaction file</p>
              <p className="text-[11px] text-slate-400 mt-1">Supports CSV, XLSX, or JSON (e.g. amount, merchant, timestamp, customer_id)</p>
              <button 
                type="button"
                className="mt-4 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
              >
                Browse Local File
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleLoadBenchmark}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 text-xs font-medium transition group"
              >
                <Database className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                <div className="text-left">
                  <div className="font-semibold text-emerald-300">Load Benchmark Data</div>
                  <div className="text-[10px] text-slate-400">Authentic UPI & fraud cases</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition group"
              >
                <Download className="w-4 h-4 text-blue-400 group-hover:translate-y-0.5 transition" />
                <div className="text-left">
                  <div className="font-semibold text-white">Download Sample CSV</div>
                  <div className="text-[10px] text-slate-400">Ready template with schema</div>
                </div>
              </button>
            </div>
          </div>
        ) : step === 'PIPELINE' ? (
          <div className="space-y-5 py-6">
            <div className="flex items-center space-x-3 text-xs">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <span className="text-white font-semibold">Processing Pipeline for: </span>
                <span className="text-slate-400 font-mono text-[11px]">{fileName}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300 font-medium">1. Schema & Column Normalization</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300 font-medium">2. Behavioral Velocity & Spatial Features</span>
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300 font-medium">3. Multi-Model Scoring (XGBoost, Isolation Forest, LSTM, Rules)</span>
                <span className="text-slate-500 text-[10px] font-mono">Running</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
              {pipelinePhase}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Dataset Ingested & Scored Successfully</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                {report?.valid_count} transactions were analyzed through FinGuard AI ensemble models and populated into the live ledger.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Total Rows</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">{report?.total_rows || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Valid Ingested</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{report?.valid_count || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Fraud Flagged</div>
                <div className="text-base font-bold text-rose-400 font-mono mt-0.5">{report?.fraud_flagged_count || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Fraud Rate</div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5">{report?.fraud_rate_percentage || 0}%</div>
              </div>
            </div>

            {report && report.errors && report.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
                <div className="font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Skipped {report.invalid_count} Invalid / Incomplete Rows</span>
                </div>
                {report.errors.map((e, idx) => (
                  <div key={idx} className="text-slate-400 text-[10px]">
                    Row {e.row}: {e.reason}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                onSuccess();
                handleClose();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
            >
              View Ingested Transactions in Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
