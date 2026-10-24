import React from 'react';
import { Globe, MapPin } from 'lucide-react';

interface GeoFraudMapProps {
  selectedRegion: string | null;
  onSelectRegion: (region: string | null) => void;
}

export const GeoFraudMap: React.FC<GeoFraudMapProps> = ({ selectedRegion, onSelectRegion }) => {
  const regions = [
    { name: 'Delhi', country: 'India', status: 'CRITICAL', color: 'text-red-400 bg-red-500/10 border-red-500/30', count: '42 Incidents', volume: '₹14.2L' },
    { name: 'London', country: 'UK', status: 'CRITICAL', color: 'text-red-400 bg-red-500/10 border-red-500/30', count: '28 Incidents', volume: '₹18.5L' },
    { name: 'Dubai', country: 'UAE', status: 'HIGH', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', count: '19 Incidents', volume: '₹9.8L' },
    { name: 'Mumbai', country: 'India', status: 'HIGH', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', count: '14 Incidents', volume: '₹6.4L' },
    { name: 'Bengaluru', country: 'India', status: 'LOW', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', count: '3 Incidents', volume: '₹1.2L' }
  ];

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Geographic Fraud Intelligence Map</span>
        </h3>
        {selectedRegion && (
          <button
            onClick={() => onSelectRegion(null)}
            className="text-[10px] text-blue-400 hover:underline"
          >
            Clear Region Filter ({selectedRegion})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {regions.map((reg) => {
          const isSelected = selectedRegion === reg.name;
          return (
            <button
              key={reg.name}
              onClick={() => onSelectRegion(isSelected ? null : reg.name)}
              className={`p-3 rounded-xl border text-left transition-all ${reg.color} ${
                isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{reg.name}</span>
                </span>
                <span className="text-[9px] font-mono uppercase font-bold">{reg.status}</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-2 font-mono">{reg.volume}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{reg.count}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
