import type { RiskLevel } from '../types/index.ts';

export function formatCurrencyINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatRiskPercentage(score: number): string {
  if (isNaN(score)) return '0%';
  const clamped = Math.max(0, Math.min(1, score));
  return `${Math.round(clamped * 100)}%`;
}

export function getRiskLevelBadge(level: RiskLevel): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (level) {
    case 'CRITICAL':
      return {
        label: 'CRITICAL',
        bgClass: 'bg-rose-500/10',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-500/30'
      };
    case 'HIGH':
      return {
        label: 'HIGH',
        bgClass: 'bg-orange-500/10',
        textClass: 'text-orange-400',
        borderClass: 'border-orange-500/30'
      };
    case 'MEDIUM':
      return {
        label: 'MEDIUM',
        bgClass: 'bg-amber-500/10',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/30'
      };
    case 'LOW':
    default:
      return {
        label: 'LOW',
        bgClass: 'bg-emerald-500/10',
        textClass: 'text-emerald-400',
        borderClass: 'border-emerald-500/30'
      };
  }
}

export function truncateIdentifier(id: string, maxLen: number = 12): string {
  if (!id) return '';
  if (id.length <= maxLen) return id;
  return `${id.slice(0, maxLen - 3)}...`;
}

export function parseTransactionStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'text-emerald-400';
    case 'FLAGGED':
    case 'UNDER_REVIEW':
      return 'text-amber-400';
    case 'BLOCKED':
    case 'FAILED':
      return 'text-rose-400';
    default:
      return 'text-slate-400';
  }
}
