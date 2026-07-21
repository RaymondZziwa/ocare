import { useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { registerPushToken } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";

// ─── Configuration ────────────────────────────────────────────────────────────

// How the app handles notifications when it is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  type?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  // Request permission and get push token
  const setupNotifications = useCallback(async () => {
    try {
      // 1. Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Push notification permission not granted");
        setHasPermission(false);
        return null;
      }

      setHasPermission(true);

      // 2. Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "9d53b8ea-29e8-46e8-99c0-d35f01b28eb0", // EAS project ID from app.json
      });

      const token = tokenData.data;
      setExpoPushToken(token);

      // 3. Register token with backend if authenticated
      if (isAuthenticated && token) {
        await registerPushToken({
          token,
          platform: Platform.OS as "ios" | "android",
        }).catch((err) => {
          console.error("Failed to register push token with backend:", err);
        });
      }

      return token;
    } catch (error) {
      console.error("Error setting up push notifications:", error);
      return null;
    }
  }, [isAuthenticated]);

  // Set up listeners on mount
  useEffect(() => {
    setupNotifications();

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((incomingNotification) => {
        setNotification(incomingNotification);
      });

    // Listen for user tapping on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification tapped:", data);

        // You can handle navigation here based on notification data
        // e.g., navigate to order screen if notification is about an order
        if (data && typeof data === "object" && "screen" in data) {
          // Navigation can be handled via a callback prop or a navigation ref
          const screen = (data as Record<string, unknown>).screen as string;
          if (screen) {
            // Emit event or navigate using router
            // This will be handled by the NotificationContext
          }
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(
          responseListener.current,
        );
      }
    };
  }, [setupNotifications]);

  /**
   * Schedule a local notification (for testing or reminders)
   */
  const scheduleLocalNotification = useCallback(
    async (payload: NotificationPayload, trigger?: Notifications.NotificationTriggerInput) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data ?? {},
        },
        trigger: trigger ?? null, // immediate
      });
    },
    [],
  );

  /**
   * Get all scheduled notifications
   */
  const getScheduledNotifications = useCallback(async () => {
    return Notifications.getAllScheduledNotificationsAsync();
  }, []);

  /**
   * Cancel a specific scheduled notification
   */
  const cancelScheduledNotification = useCallback(async (identifier: string) => {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }, []);

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllScheduledNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  /**
   * Set the badge number
   */
  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  /**
   * Get the current badge count
   */
  const getBadgeCount = useCallback(async () => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  return {
    expoPushToken,
    notification,
    hasPermission,
    setupNotifications,
    scheduleLocalNotification,
    getScheduledNotifications,
    cancelScheduledNotification,
    cancelAllScheduledNotifications,
    setBadgeCount,
    getBadgeCount,
  };
}
