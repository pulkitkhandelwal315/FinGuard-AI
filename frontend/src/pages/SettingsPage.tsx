import React from 'react';
import { Settings, Shield, Bell, Lock, User, Key, Server, Webhook } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">Enterprise Security & System Integration Policies</h2>
        <p className="text-xs text-slate-400">Manage MFA policies, API keys, Webhook destinations, and active sessions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>Profile & Account</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400">Full Name</label>
              <input type="text" value={user?.name || ''} readOnly className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400">Email Address</label>
              <input type="text" value={user?.email || ''} readOnly className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400">System Role</label>
              <input type="text" value={user?.role || ''} readOnly className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-blue-400 font-bold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Security & MFA */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Security Controls</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Enforce Multi-Factor Authentication (MFA)</div>
                  <div className="text-[11px] text-slate-400">Mandatory for threshold modifications and rule deployment</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ENABLED</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">IP Whitelist Enforcement</div>
                  <div className="text-[11px] text-slate-400">Restrict admin operations to corporate IP subnet (10.0.0.0/24)</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Webhooks & Integrations */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Webhook className="w-4 h-4 text-purple-400" />
              <span>SIEM & Alert Webhook Destinations</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Slack Alert Channel (#fraud-alerts)</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Splunk SIEM Webhook</span>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
