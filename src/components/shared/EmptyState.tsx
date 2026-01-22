"use client";

import { Empty, Typography, Button } from "antd";
import { ReactNode } from "react";

const { Text, Title } = Typography;

interface EmptyStateProps {
  title?: string;
  description?: string | ReactNode;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
      {icon ? (
        <div className="mb-4">{icon}</div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
      )}
      
      {title && (
        <Title level={4} className="!mb-2 text-gray-700">
          {title}
        </Title>
      )}
      
      {description && (
        <Text type="secondary" className="text-center max-w-md">
          {description}
        </Text>
      )}
      
      {action && (
        <Button
          type="primary"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
