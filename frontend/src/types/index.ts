export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'USER' | 'FRAUD_ANALYST' | 'ADMIN' | 'SENIOR_ANALYST' | 'AUDITOR';

export interface Transaction {
  id: string;
  transaction_id: string;
  timestamp: string;
  amount: number;
  currency: string;
  merchant: string;
  merchant_id?: string;
  merchant_category: string;
  payment_method: string;
  location: string;
  account_id: string;
  customer_id: string;
  device_id: string;
  ip_address: string;
  transaction_type: string;
  status: string;
  fraud_probability?: number;
  anomaly_score?: number;
  risk_score?: number;
  risk_level?: RiskLevel;
  status_flag?: string;
  fraud_typology?: string;
  created_at: string;
}

export interface CustomerProfile {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  risk_score: number;
  risk_level: RiskLevel;
  total_transactions: number;
  total_volume_inr: number;
  fraud_alert_count: number;
  linked_devices: string[];
  known_locations: string[];
  created_at: string;
}

export interface MerchantProfile {
  merchant_id: string;
  name: string;
  category: string;
  risk_score: number;
  risk_level: RiskLevel;
  total_volume_inr: number;
  transaction_count: number;
  fraud_rate: number;
  chargeback_rate: number;
  top_location: string;
}

export interface DeviceProfile {
  device_id: string;
  device_type: string;
  os_browser: string;
  risk_score: number;
  risk_level: RiskLevel;
  linked_accounts: string[];
  known_ips: string[];
  velocity_score: number;
  first_seen: string;
  last_seen: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  details: string;
  ip_address: string;
  prev_hash?: string;
  current_hash?: string;
}

export interface FeatureContribution {
  feature_name: string;
  impact_percentage: number;
  is_risk_increasing: boolean;
  description: string;
}

export interface RuleTriggered {
  rule_id: string;
  rule_name: string;
  severity: string;
  description: string;
}

export interface Alert {
  id: string;
  transaction_id: string;
  account_id: string;
  customer_id: string;
  amount: number;
  merchant: string;
  severity: RiskLevel;
  title: string;
  description: string;
  status: 'UNRESOLVED' | 'RESOLVED' | 'UNDER_INVESTIGATION';
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  event_type: string;
}

export interface EntityNode {
  id: string;
  label: string;
  type: 'CUSTOMER' | 'TRANSACTION' | 'DEVICE' | 'IP' | 'MERCHANT' | 'ACCOUNT';
  risk_level?: RiskLevel;
}

export interface EntityEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface InvestigationCase {
  case_id: string;
  transaction_id: string;
  customer_id: string;
  amount: number;
  merchant: string;
  risk_score: number;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'CLOSED_FRAUD' | 'CLOSED_LEGITIMATE' | 'ESCALATED';
  priority: RiskLevel;
  assigned_analyst: string;
  created_at: string;
  updated_at: string;
  timeline: TimelineEvent[];
  notes: { id: string; author: string; text: string; timestamp: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
  tool_calls?: { tool_name: string; arguments: any; result: any }[];
}
