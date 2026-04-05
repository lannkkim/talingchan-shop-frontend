import React, { useMemo, useCallback } from "react";
import Badge from "antd/es/badge";
import Dropdown from "antd/es/dropdown";
import Typography from "antd/es/typography";
import Spin from "antd/es/spin";
import Button from "antd/es/button";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { Notification } from "@/types/notification";
import { useWebSocket } from "@/hooks/useWebSocket";

const { Text } = Typography;

// Simple native time format
function formatRelativeTime(dateString: string, locale: string) {
  const date = new Date(dateString);
  const now = new Date();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const diffInMilliseconds = date.getTime() - now.getTime();
  const diffInSeconds = Math.round(diffInMilliseconds / 1000);

  if (Math.abs(diffInSeconds) < 60) return rtf.format(diffInSeconds, "second");

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) return rtf.format(diffInMinutes, "minute");

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) return rtf.format(diffInHours, "hour");

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) return rtf.format(diffInDays, "day");

  const diffInMonths = Math.round(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) return rtf.format(diffInMonths, "month");

  const diffInYears = Math.round(diffInDays / 365);
  return rtf.format(diffInYears, "year");
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(1, 10),
    enabled: isAuthenticated,
  });

  // Real-time: invalidate on new_notification event
  const handleWsMessage = useCallback((event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "new_notification") {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    } catch {
      // ignore malformed messages
    }
  }, [queryClient]);

  useWebSocket(isAuthenticated ? "/api/v1/ws/notifications" : null, {
    onMessage: handleWsMessage,
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications: Notification[] = notificationsData?.data || [];
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.notification_id);
    }

    if (notification.reference_type === "ORDER" && notification.reference_id) {
      // Basic deep link routing
      const sellerTypes = [
        "NEW_ORDER",
        "PAYMENT_COMPLETED",
        "ORDER_COMPLETED",
        "ORDER_CANCEL_REQUESTED",
        "REFUND_REQUESTED",
        "RETURN_TRACKING_UPDATED",
        "PAYMENT_SLIP_UPLOADED"
      ];

      if (sellerTypes.includes(notification.type)) {
        router.push(`/shop?tab=orders`);
      } else {
        // Buyer side: tab key is 'purchases'
        router.push(`/profile?tab=purchases`);
      }
    }
  };

  const menu = (
    <div className="bg-white rounded-lg shadow-xl shadow-gray-200/50 min-w-[320px] overflow-hidden border border-gray-100">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <Text strong>การแจ้งเตือน</Text>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => markAllAsReadMutation.mutate()}
            loading={markAllAsReadMutation.isPending}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            อ่านทั้งหมด
          </Button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-6">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Text type="secondary">ไม่มีการแจ้งเตือนรอดำเนินการ</Text>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 text-gray-800 dark:text-gray-100">
            {notifications.map((item: Notification) => (
              <div
                key={item.notification_id}
                onClick={() => handleNotificationClick(item)}
                className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50/80 ${
                  !item.is_read ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex flex-col w-full gap-1">
                  <div className="flex justify-between items-start">
                    <Text strong={!item.is_read} className="text-sm">
                      {item.title}
                    </Text>
                    <Text type="secondary" className="text-[11px] whitespace-nowrap ml-2">
                      {formatRelativeTime(item.created_at, locale)}
                    </Text>
                  </div>
                  <Text type="secondary" className="text-xs line-clamp-2 leading-relaxed">
                    {item.message}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <Dropdown popupRender={() => menu} trigger={["click"]} placement="bottomRight">
      <Badge count={unreadCount} overflowCount={99} className="cursor-pointer">
        <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <BellOutlined className="text-[20px] text-gray-600" />
        </div>
      </Badge>
    </Dropdown>
  );
}
