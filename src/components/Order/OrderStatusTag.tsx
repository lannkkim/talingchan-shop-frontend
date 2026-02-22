import React from "react";
import { Tag } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

interface OrderStatusTagProps {
  status: string;
  t: (key: string) => string;
}

export const OrderStatusTag: React.FC<OrderStatusTagProps> = ({ status, t }) => {
  let color = "default";
  let icon: React.ReactNode = null;
  let text = t(status) || status;

  switch (status) {
    case "pending_approve":
    case "WVP":
      color = "warning";
      icon = <ClockCircleOutlined />;
      // Use short code for consistent translation key if possible, or handle both
      break;
    case "PD":
    case "pending":
      color = "warning";
      icon = <ClockCircleOutlined />;
      break;
    case "AP":
    case "paid":
      color = "success";
      icon = <CheckCircleOutlined />;
      break;
    case "RS":
    case "shipped":
      color = "processing";
      icon = <CarOutlined />;
      break;
    case "CP":
    case "completed":
      color = "success";
      icon = <CheckCircleOutlined />;
      break;
    case "CC":
    case "cancelled":
      color = "error";
      icon = <CloseCircleOutlined />;
      break;
    case "RJ":
      color = "error";
      icon = <CloseCircleOutlined />;
      break;
    case "RF":
      color = "volcano";
      icon = <ReloadOutlined />;
      break;
    case "WP":
      color = "cyan";
      icon = <ClockCircleOutlined />;
      break;
    case "WS":
      color = "blue";
      icon = <ClockCircleOutlined />;
      break;
    case "WA":
      color = "purple";
      break;
    case "CPA":
      color = "gold";
      break;
    case "NCA":
      color = "default";
      break;
    case "WO":
      color = "magenta";
      break;
    case "delivered": // Special case for Shop UI delivered state display
      color = "success";
      icon = <CheckCircleOutlined />;
      break;
  }

  return (
    <Tag
      color={color}
      icon={icon}
      className="m-0 text-[11px] px-2.5 py-0.5 rounded-full border-transparent shadow-sm"
    >
      {text}
    </Tag>
  );
};
