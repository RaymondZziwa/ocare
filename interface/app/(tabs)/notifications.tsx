import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCheck,
  Clock,
  MessageSquare,
  Package,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotificationContext } from "@/context/NotificationContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type AppNotification,
} from "@/services/notificationService";
import { toast } from "sonner-native";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getNotificationIcon = (type?: string) => {
  switch (type) {
    case "order":
      return <ShoppingBag size={20} color="#059669" />;
    case "shipping":
      return <Truck size={20} color="#7c3aed" />;
    case "promotion":
      return <MessageSquare size={20} color="#d97706" />;
    case "reminder":
      return <Clock size={20} color="#2563eb" />;
    default:
      return <Bell size={20} color="#6b7280" />;
  }
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const { unreadCount, setUnreadCount } = useNotificationContext();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadNotifications = useCallback(async (refresh = false) => {
    try {
      const response = await getNotifications({ limit: 50 });
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      if (!refresh) toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotifications(true);
  }, [loadNotifications]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await markNotificationRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [unreadCount, setUnreadCount],
  );

  const handleMarkAllRead = useCallback(async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  }, [setUnreadCount]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id);
        const deleted = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
        toast.success("Notification deleted");
      } catch (error) {
        console.error("Failed to delete notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [notifications, unreadCount, setUnreadCount],
  );

  const handleNotificationPress = useCallback(
    async (notification: AppNotification) => {
      // Mark as read on tap
      if (!notification.isRead) {
        handleMarkRead(notification.id);
      }

      // Navigate based on notification data
      const data = notification.data || {};
      const screen = data.screen as string | undefined;

      if (screen) {
        const params = (data.params as Record<string, string>) || {};
        router.push({ pathname: screen as any, params: params as any });
      }
    },
    [handleMarkRead, router],
  );

  // ── Render notification item ─────────────────────────────────────────────────

  const renderNotification = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.notificationUnread]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            style={[styles.notificationTitle, !item.isRead && styles.notificationTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>

      <View style={styles.notificationActions}>
        {!item.isRead && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMarkRead(item.id)}
          >
            <CheckCheck size={16} color="#059669" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ── Loading state ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <>
                  <CheckCheck size={18} color="#059669" />
                  <Text style={styles.markAllText}>Mark All Read</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 100 }} />
          )}
        </View>

        {/* List */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#059669"
              colors={["#059669"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BellOff size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>
                You're all caught up! Check back later for updates.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, backgroundColor: "#f9fafb" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: { padding: 4, marginRight: 8 },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  unreadBadge: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ecfdf5",
  },
  markAllText: { fontSize: 12, fontWeight: "600", color: "#059669" },

  // Loading
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 15, color: "#6b7280" },

  // List
  listContent: { paddingVertical: 8, paddingHorizontal: 16 },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#374151", marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: "#9ca3af", marginTop: 6, textAlign: "center", paddingHorizontal: 32 },

  // Notification item
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationUnread: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#059669",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  notificationContent: { flex: 1 },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: { fontSize: 14, fontWeight: "600", color: "#374151", flex: 1 },
  notificationTitleUnread: { color: "#059669", fontWeight: "700" },
  notificationTime: { fontSize: 11, color: "#9ca3af", marginLeft: 8 },
  notificationBody: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  notificationActions: {
    justifyContent: "center",
    gap: 4,
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
});
