export interface Notification {
  notification_id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  title: string;
  message: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;

  // Populated fields
  actor_name?: string;
  actor_image?: string;
}

export interface NotificationResponse {
  data: Notification[];
}

export interface MarkAsReadResponse {
  message: string;
  data: null;
}
