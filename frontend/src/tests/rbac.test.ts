import test from 'node:test';
import assert from 'node:assert';
import {
  canManageRules,
  canInvestigateCases,
  canAccessMLOps,
  canViewAuditLogs,
  getRoleBadgeClass
} from '../utils/rbac.ts';

test('canManageRules allows only ADMIN', () => {
  assert.strictEqual(canManageRules('ADMIN'), true);
  assert.strictEqual(canManageRules('FRAUD_ANALYST'), false);
  assert.strictEqual(canManageRules('USER'), false);
});

test('canInvestigateCases allows ADMIN and FRAUD_ANALYST', () => {
  assert.strictEqual(canInvestigateCases('ADMIN'), true);
  assert.strictEqual(canInvestigateCases('FRAUD_ANALYST'), true);
  assert.strictEqual(canInvestigateCases('USER'), false);
});

test('canAccessMLOps allows only ADMIN', () => {
  assert.strictEqual(canAccessMLOps('ADMIN'), true);
  assert.strictEqual(canAccessMLOps('FRAUD_ANALYST'), false);
  assert.strictEqual(canAccessMLOps('USER'), false);
});

test('canViewAuditLogs allows ADMIN and FRAUD_ANALYST', () => {
  assert.strictEqual(canViewAuditLogs('ADMIN'), true);
  assert.strictEqual(canViewAuditLogs('FRAUD_ANALYST'), true);
  assert.strictEqual(canViewAuditLogs('USER'), false);
});

test('getRoleBadgeClass provides custom role color classes', () => {
  assert.ok(getRoleBadgeClass('ADMIN').includes('purple'));
  assert.ok(getRoleBadgeClass('FRAUD_ANALYST').includes('blue'));
  assert.ok(getRoleBadgeClass('USER').includes('slate'));
});
