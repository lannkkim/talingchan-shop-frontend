"use client";

import { Typography, Button } from "antd";
import { ReactNode } from "react";

const { Title, Text } = Typography;

interface PageToolbarProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  actions?: ReactNode;
  stats?: { label: string; value: string | number }[];
  className?: string;
}

export default function PageToolbar({
  title,
  subtitle,
  actions,
  stats,
  className = "",
}: PageToolbarProps) {
  return (
    <div className={`flex justify-between items-start mb-6 ${className}`}>
      <div className="flex-1">
        {typeof title === "string" ? (
          <Title level={3} className="!mb-0">
            {title}
          </Title>
        ) : (
          title
        )}
        
        {subtitle && (
          <div className="mt-2">
            {typeof subtitle === "string" ? (
              <Text type="secondary">{subtitle}</Text>
            ) : (
              subtitle
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {stats?.map((stat, index) => (
          <div key={index} className="text-right">
            <Text type="secondary" className="block text-xs">
              {stat.label}
            </Text>
            <Text strong className="text-base">
              {stat.value}
            </Text>
          </div>
        ))}
        
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
