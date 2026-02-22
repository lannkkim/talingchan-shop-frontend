import React from "react";
import { Tag } from "antd";

export type StatusDomain = "shop" | "user_role";

interface StatusTagProps {
  domain: StatusDomain;
  status: string;
  className?: string;
}

const statusConfig: Record<StatusDomain, Record<string, { color: string; label: string }>> = {
  shop: {
    approved: { color: "success", label: "APPROVED" },
    pending_approve: { color: "warning", label: "PENDING" },
    suspended: { color: "error", label: "SUSPENDED" },
    active: { color: "success", label: "ACTIVE" },
    inactive: { color: "default", label: "INACTIVE" },
  },
  user_role: {
    admin: { color: "red", label: "ADMIN" },
    shop: { color: "green", label: "SHOP" },
    user: { color: "blue", label: "USER" },
  },
};

export const StatusTag: React.FC<StatusTagProps> = ({ domain, status, className }) => {
  const lowerStatus = status?.toLowerCase() || "";
  const config = statusConfig[domain][lowerStatus] || { 
    color: "default", 
    label: status?.toUpperCase() || "UNKNOWN" 
  };

  return (
    <Tag color={config.color} className={className}>
      {config.label}
    </Tag>
  );
};
