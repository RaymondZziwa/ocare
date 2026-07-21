import { apiRequest } from "@/libs/apiConfig";
import { NotificationEndpoints } from "@/endpoints/notification/notificationEndpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PushTokenData {
  token: string;
  platform: "ios" | "android";
  deviceId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  type?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  reminders: boolean;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Register the device push token with the backend.
 * POST /api/notifications/register-token
 */
export const registerPushToken = async (data: PushTokenData): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    NotificationEndpoints.REGISTER_PUSH_TOKEN,
    "POST",
    data,
  );
};

/**
 * Save or update FCM token (alternative endpoint).
 * POST /api/notifications/save-fcm-token
 */
export const saveFcmToken = async (data: { fcmToken: string; deviceId?: string }): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    NotificationEndpoints.SAVE_FCM_TOKEN,
    "POST",
    data,
  );
};

/**
 * Get all notifications for the current user.
 * GET /api/notifications
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<{ data: AppNotification[]; total: number; unreadCount: number }> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.unreadOnly) query.set("unreadOnly", "true");

  const queryStr = query.toString();
  const endpoint = queryStr
    ? `${NotificationEndpoints.GET_NOTIFICATIONS}?${queryStr}`
    : NotificationEndpoints.GET_NOTIFICATIONS;

  return apiRequest<{ data: AppNotification[]; total: number; unreadCount: number }>(endpoint, "GET");
};

/**
 * Mark a single notification as read.
 * PATCH /api/notifications/mark-read/:id
 */
export const markNotificationRead = async (id: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    `${NotificationEndpoints.MARK_READ}/${id}`,
    "PATCH",
  );
};

/**
 * Mark all notifications as read.
 * PATCH /api/notifications/mark-all-read
 */
export const markAllNotificationsRead = async (): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    NotificationEndpoints.MARK_ALL_READ,
    "PATCH",
  );
};

/**
 * Delete a notification.
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (id: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    `${NotificationEndpoints.DELETE_NOTIFICATION}/${id}`,
    "DELETE",
  );
};

/**
 * Get or update notification settings.
 * GET/PUT /api/notifications/settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  return apiRequest<NotificationSettings>(
    NotificationEndpoints.UPDATE_NOTIFICATION_SETTINGS,
    "GET",
  );
};

export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>,
): Promise<NotificationSettings> => {
  return apiRequest<NotificationSettings>(
    NotificationEndpoints.UPDATE_NOTIFICATION_SETTINGS,
    "PUT",
    settings,
  );
};
