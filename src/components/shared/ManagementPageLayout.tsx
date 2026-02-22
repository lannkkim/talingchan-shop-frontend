import React from "react";
import { Card, Typography, Space } from "antd";

const { Title, Text } = Typography;

interface ManagementPageLayoutProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  noCardPadding?: boolean;
}

export const ManagementPageLayout: React.FC<ManagementPageLayoutProps> = ({
  title,
  description,
  extra,
  children,
  noCardPadding = false,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={2} className="!m-0">{title}</Title>
          {description && <Text type="secondary">{description}</Text>}
        </div>
        {extra && <Space>{extra}</Space>}
      </div>

      <Card 
        className="shadow-sm border-gray-100" 
        styles={{ body: noCardPadding ? { padding: 0 } : {} }}
      >
        {children}
      </Card>
    </div>
  );
};
