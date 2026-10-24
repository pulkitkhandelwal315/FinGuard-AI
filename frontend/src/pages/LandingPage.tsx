import React from 'react';
import { ShieldAlert, ArrowRight, Activity, Cpu, Sparkles, Lock, BarChart3, Bot, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onExploreDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreDashboard }) => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Style Financial Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Detect Fraud Before It Becomes a{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
            Financial Loss.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          AI-powered transaction intelligence combining Supervised XGBoost, Unsupervised Isolation Forest, PyTorch LSTM sequence modeling, SHAP explainability, real-time alerting, and RAG AI financial assistance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onExploreDashboard}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all"
          >
            <span>Explore Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 space-y-3 border-t-2 border-t-blue-500">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">4-Model Ensemble Pipeline</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combines XGBoost supervised classifier, Isolation Forest anomaly scoring, PyTorch LSTM sequence modeling, and configurable rules into a unified risk aggregator.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3 border-t-2 border-t-indigo-500">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">SHAP Explainable AI</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every transaction includes exact percentage feature contributions (+31% Amount, +24% New Device) and natural language explanations for total auditability.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3 border-t-2 border-t-cyan-500">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">RAG AI Assistant</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Conversational assistant backed by local vector search and backend tool execution (`get_transaction`, `get_spending_summary`, `compare_periods`) with strict safety guardrails.
          </p>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="glass-panel p-8 text-center space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Enterprise Technology Architecture
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['React', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'PostgreSQL / pgvector', 'XGBoost', 'PyTorch / LSTM', 'Isolation Forest', 'SHAP', 'WebSockets', 'MLflow'].map(tech => (
            <span key={tech} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-medium text-slate-300">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};
