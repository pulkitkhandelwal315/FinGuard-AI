import test from 'node:test';
import assert from 'node:assert';
import {
  formatCurrencyINR,
  formatRiskPercentage,
  getRiskLevelBadge,
  truncateIdentifier,
  parseTransactionStatusColor
} from '../utils/formatters.ts';

test('formatCurrencyINR formats valid amounts in INR currency', () => {
  const result = formatCurrencyINR(48250);
  assert.ok(result.includes('48,250'), `Expected 48,250 in ${result}`);
});

test('formatCurrencyINR handles zero and NaN gracefully', () => {
  const zero = formatCurrencyINR(0);
  assert.ok(zero.includes('0'), `Expected 0 in ${zero}`);

  const nan = formatCurrencyINR(NaN);
  assert.strictEqual(nan, '₹0.00');
});

test('formatRiskPercentage formats score as integer percentage', () => {
  assert.strictEqual(formatRiskPercentage(0.874), '87%');
  assert.strictEqual(formatRiskPercentage(0.05), '5%');
  assert.strictEqual(formatRiskPercentage(1.0), '100%');
  assert.strictEqual(formatRiskPercentage(0.0), '0%');
});

test('getRiskLevelBadge returns proper theme tokens for each level', () => {
  const critical = getRiskLevelBadge('CRITICAL');
  assert.strictEqual(critical.label, 'CRITICAL');
  assert.ok(critical.textClass.includes('rose-400'));

  const high = getRiskLevelBadge('HIGH');
  assert.strictEqual(high.label, 'HIGH');
  assert.ok(high.textClass.includes('orange-400'));

  const medium = getRiskLevelBadge('MEDIUM');
  assert.strictEqual(medium.label, 'MEDIUM');
  assert.ok(medium.textClass.includes('amber-400'));

  const low = getRiskLevelBadge('LOW');
  assert.strictEqual(low.label, 'LOW');
  assert.ok(low.textClass.includes('emerald-400'));
});

test('truncateIdentifier truncates long IDs properly', () => {
  const shortId = 'TXN-101';
  assert.strictEqual(truncateIdentifier(shortId, 10), 'TXN-101');

  const longId = 'TXN-102938475610293';
  const truncated = truncateIdentifier(longId, 10);
  assert.strictEqual(truncated, 'TXN-102...');
  assert.strictEqual(truncated.length, 10);
});

test('parseTransactionStatusColor returns correct color classes', () => {
  assert.strictEqual(parseTransactionStatusColor('COMPLETED'), 'text-emerald-400');
  assert.strictEqual(parseTransactionStatusColor('FLAGGED'), 'text-amber-400');
  assert.strictEqual(parseTransactionStatusColor('BLOCKED'), 'text-rose-400');
  assert.strictEqual(parseTransactionStatusColor('UNKNOWN'), 'text-slate-400');
});
