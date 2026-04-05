export interface AuditLog {
  audit_log_id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: Record<string, unknown>;
  created_at: string;
}
