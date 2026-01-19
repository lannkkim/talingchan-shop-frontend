import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
