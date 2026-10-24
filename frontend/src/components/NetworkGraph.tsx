import React from 'react';
import { EntityNode, EntityEdge } from '../types';
import { Network, Laptop, Globe, Store, User, CreditCard } from 'lucide-react';

interface NetworkGraphProps {
  nodes: EntityNode[];
  edges: EntityEdge[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, edges }) => {
  // Compute circle layout positions for nodes
  const width = 600;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 130;

  const nodePositions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = i === 0 ? centerX : centerX + radius * Math.cos(angle);
    const y = i === 0 ? centerY : centerY + radius * Math.sin(angle);
    return { ...node, x, y };
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'DEVICE': return <Laptop className="w-4 h-4 text-purple-400" />;
      case 'IP': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'MERCHANT': return <Store className="w-4 h-4 text-amber-400" />;
      case 'CUSTOMER': return <User className="w-4 h-4 text-blue-400" />;
      default: return <CreditCard className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs font-bold text-white flex items-center space-x-2">
          <Network className="w-4 h-4 text-indigo-400" />
          <span>Related Entity Network Topology Graph</span>
        </h4>
        <span className="text-[10px] text-slate-400 font-mono">Shared Device / IP Ring Clusters</span>
      </div>

      <div className="relative w-full bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-80">
          {/* Edges */}
          {edges.map((edge, idx) => {
            const sourceNode = nodePositions.find(n => n.id === edge.source);
            const targetNode = nodePositions.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <g key={idx}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodePositions.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                r="22"
                className={`transition-all ${
                  node.risk_level === 'CRITICAL' || node.risk_level === 'HIGH'
                    ? 'fill-rose-950 stroke-rose-500 stroke-2'
                    : 'fill-slate-900 stroke-slate-700 stroke-1'
                }`}
              />
              <foreignObject x="-10" y="-10" width="20" height="20">
                <div className="w-full h-full flex items-center justify-center">
                  {getNodeIcon(node.type)}
                </div>
              </foreignObject>
              <text
                y="34"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
