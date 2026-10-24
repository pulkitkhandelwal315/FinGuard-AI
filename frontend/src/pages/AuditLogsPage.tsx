import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';
import { ShieldCheck, RefreshCw, Lock, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    total_logs: number;
    head_hash?: string;
    algorithm?: string;
    message?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/entities/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.audit_logs || []);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/entities/audit-logs/verify');
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      }
    } catch {
      setVerificationResult({
        valid: false,
        total_logs: 0,
        message: 'Cryptographic verification request failed.'
      });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    handleVerifyChain();
  }, []);

  const filteredLogs = auditLogs.filter(log =>
    log.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Cryptographic Append-Only Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable, SHA-256 tamper-evident hash-chained ledger of all financial actions, rule edits, and system events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Chain...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Cryptographic Integrity</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Status Card */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          verificationResult.valid
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center space-x-3">
            {verificationResult.valid ? (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">
                  {verificationResult.valid ? 'Cryptographic Hash-Chain Integrity Verified' : 'Integrity Compromised: Tampering Detected'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
                  {verificationResult.algorithm || 'SHA-256 Chained'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {verificationResult.valid
                  ? `All ${verificationResult.total_logs} ledger entries consecutively verified without any broken links or modified payloads.`
                  : verificationResult.message || 'Block hash mismatch identified in ledger sequence.'}
              </p>
            </div>
          </div>

          {verificationResult.head_hash && (
            <div className="text-left sm:text-right font-mono text-[10px] text-slate-400">
              <span className="text-slate-500 block">HEAD BLOCK HASH</span>
              <span className="text-emerald-400 font-semibold">{verificationResult.head_hash.slice(0, 16)}...{verificationResult.head_hash.slice(-8)}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor, target entity, or details..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredLogs.length} of {auditLogs.length} total blocks
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800 tracking-wider">
              <tr>
                <th className="p-3.5">Block ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor & Role</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5">SHA-256 Block Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                    <span>Loading cryptographic ledger...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const currHash = log.current_hash || '';
                  const prevHash = log.prev_hash || '';
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {log.id}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">{log.actor}</div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          log.role === 'ADMIN' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/40' :
                          log.role === 'SYSTEM' ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-800/40' :
                          'bg-blue-900/40 text-blue-300 border border-blue-800/40'
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-white tracking-tight">{log.action}</span>
                      </td>
                      <td className="p-3.5 font-mono text-amber-400 whitespace-nowrap">
                        {log.target}
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-3.5 font-mono text-[10px]">
                        {currHash ? (
                          <div className="flex flex-col gap-0.5">
                            <span
                              className="text-emerald-400 cursor-pointer hover:underline"
                              onClick={() => setSelectedHash(selectedHash === currHash ? null : currHash)}
                              title={`Current: ${currHash}\nPrevious: ${prevHash}`}
                            >
                              {currHash.slice(0, 10)}...{currHash.slice(-6)}
                            </span>
                            <span className="text-slate-500 text-[9px]">
                              prev: {prevHash ? `${prevHash.slice(0, 8)}...` : 'GENESIS'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
