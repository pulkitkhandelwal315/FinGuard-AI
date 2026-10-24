import type { UserRole } from '../types/index.ts';

export function canManageRules(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canInvestigateCases(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'FRAUD_ANALYST';
}

export function canAccessMLOps(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canViewAuditLogs(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'FRAUD_ANALYST';
}

export function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'FRAUD_ANALYST':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'USER':
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}
