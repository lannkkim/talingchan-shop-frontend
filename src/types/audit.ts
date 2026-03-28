export interface AuditLog {
  admin_audit_log_id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  admin?: {
    username: string;
  };
}
