import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Platform, AppState, type AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import { registerPushToken } from "@/services/notificationService";

// ─── Configuration ────────────────────────────────────────────────────────────

// This must be set before any notification events are handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationData {
  title: string;
  body: string;
  screen?: string;
  params?: Record<string, string>;
  type?: string;
  [key: string]: unknown;
}

interface NotificationContextType {
  expoPushToken: string | null;
  lastNotification: Notifications.Notification | null;
  hasPermission: boolean;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshToken: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const appState = useRef(AppState.currentState);
  const notificationResponseListener = useRef<Notifications.EventSubscription>();

  // ── Setup push notifications ────────────────────────────────────────────────

  const setupPushNotifications = useCallback(async () => {
    try {
      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Push notification permission not granted");
        setHasPermission(false);
        return;
      }

      setHasPermission(true);

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "9d53b8ea-29e8-46e8-99c0-d35f01b28eb0",
      });

      const token = tokenData.data;
      setExpoPushToken(token);

      // Register with backend
      if (token && isAuthenticated) {
        await registerPushToken({
          token,
          platform: Platform.OS as "ios" | "android",
        }).catch((err) => {
          console.warn("Failed to register push token with backend:", err.message);
        });
      }

      // Android specific channel configuration
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF1DA250",
        });

        await Notifications.setNotificationChannelAsync("orders", {
          name: "Order Updates",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF1DA250",
        });

        await Notifications.setNotificationChannelAsync("promotions", {
          name: "Promotions",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    } catch (error) {
      console.error("Failed to setup push notifications:", error);
    }
  }, [isAuthenticated]);

  // ── Handle notification tap / response ───────────────────────────────────────

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content
        .data as NotificationData | null;

      if (!data) return;

      const screen = data.screen;
      const params = data.params ?? {};

      // Navigate based on notification type
      if (screen) {
        try {
          router.push({
            pathname: screen as any,
            params: params as any,
          });
        } catch (err) {
          console.warn("Failed to navigate from notification:", err);
        }
      } else if (data.type === "order") {
        // Default: navigate to order history if notification is about an order
        const orderId = (params.orderId as string) || "";
        if (orderId) {
          router.push({
            pathname: `/profile/orders/${orderId}` as any,
            params: params as any,
          });
        } else {
          router.push("/profile/orders" as any);
        }
      }
    },
    [router],
  );

  // ── Effects ──────────────────────────────────────────────────────────────────

  // Set up notifications when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      setupPushNotifications();
    }
  }, [isAuthenticated, setupPushNotifications]);

  // Listen for notification responses (tapping on notification)
  useEffect(() => {
    // Handle tapping on notification while app is not in foreground
    // This checks if the app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Listen for future notification taps
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse,
      );

    return () => {
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current,
        );
      }
    };
  }, [handleNotificationResponse]);

  // Listen for app state changes and re-register token if needed
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App has come to the foreground
          // Optionally refresh unread count here
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const refreshToken = useCallback(async () => {
    await setupPushNotifications();
  }, [setupPushNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        lastNotification,
        hasPermission,
        unreadCount,
        setUnreadCount,
        refreshToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
