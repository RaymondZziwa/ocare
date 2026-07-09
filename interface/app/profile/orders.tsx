import { useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";
import { baseURL } from "@/libs/apiConfig";
import { useAuth } from "@/context/AuthContext";
import { getOrders, type Order } from "@/services/profileService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_PRIORITY: Record<string, number> = {
  PENDING: 0,
  PACKAGING: 1,
  IN_DELIVERY: 2,
  SUCCESSFUL: 3,
  FAILED: 4,
  CANCELLED: 5,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: "Pending", color: "#d97706", bg: "#fffbeb", icon: Clock },
  PACKAGING: { label: "Packaging", color: "#2563eb", bg: "#eff6ff", icon: Package },
  IN_DELIVERY: { label: "In Delivery", color: "#7c3aed", bg: "#f5f3ff", icon: Truck },
  SUCCESSFUL: { label: "Completed", color: "#059669", bg: "#ecfdf5", icon: CheckCircle2 },
  FAILED: { label: "Failed", color: "#dc2626", bg: "#fef2f2", icon: AlertCircle },
  CANCELLED: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6", icon: AlertCircle },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UNPAID: { label: "Unpaid", color: "#dc2626", bg: "#fef2f2" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "#d97706", bg: "#fffbeb" },
  FULLY_PAID: { label: "Paid", color: "#059669", bg: "#ecfdf5" },
};

const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const clean = url.startsWith("/") ? url.slice(1) : url;
  return `${baseURL}/${clean}`;
};

const formatAmount = (amount: number) => `UGX ${amount}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    }
    return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }
    setIsLoading(true);
    try {
      const data = await getOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter & sort: pending/active orders first
  const displayedOrders = useMemo(() => {
    let list = orders;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.saleStatus.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q)),
      );
    }
    return [...list].sort((a, b) => {
      const pa = STATUS_PRIORITY[a.saleStatus] ?? 99;
      const pb = STATUS_PRIORITY[b.saleStatus] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, searchQuery]);

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: `/profile/orders/${order.id}` as any,
      params: {
        orderId: order.id,
        saleStatus: order.saleStatus,
        paymentStatus: order.paymentStatus,
        total: String(order.total),
        balance: String(order.balance),
        type: order.type,
        createdAt: order.createdAt,
        items: JSON.stringify(order.items),
      },
    });
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ChevronRight size={24} color="#1f2937" style={{ transform: [{ rotate: "180deg" }] }} />
          </TouchableOpacity>
          <Text style={styles.title}>Order History</Text>
          <View style={styles.iconBtn} />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, status or item..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearBtn}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryCount}>{orders.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryCount}>{orders.filter((o) => o.saleStatus === "SUCCESSFUL").length}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryCount}>
              {orders.filter((o) => ["PENDING", "PACKAGING", "IN_DELIVERY"].includes(o.saleStatus)).length}
            </Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
        </View>

        {/* List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {displayedOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <ShoppingBag size={72} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No orders here</Text>
              <Text style={styles.emptySub}>
                {searchQuery ? `No results match "${searchQuery}"` : "Your order history will appear here"}
              </Text>
            </View>
          ) : (
            displayedOrders.map((order) => (
              <OrderCard key={order.id} order={order} onPress={() => handleOrderPress(order)} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const statusCfg = STATUS_CONFIG[order.saleStatus] ?? STATUS_CONFIG.CANCELLED;
  const payCfg = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG.UNPAID;
  const StatusIcon = statusCfg.icon;
  const itemCount = order.items.length;
  const previewItems = order.items.slice(0, 3);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Top row – ID + status */}
      <View style={styles.cardTop}>
        <View style={styles.cardIdRow}>
          <ShoppingBag size={14} color="#6b7280" />
          <Text style={styles.cardId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          <View style={styles.cardDateBadge}>
            <Text style={styles.cardDate}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
          <StatusIcon size={12} color={statusCfg.color} />
          <Text style={[styles.statusPillText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Items preview */}
      <View style={styles.cardItems}>
        {previewItems.map((item) => (
          <View key={item.id} style={styles.cardItemRow}>
            <View style={styles.cardItemThumb}>
              {item.image && getFullImageUrl(item.image) ? (
                <Image source={{ uri: getFullImageUrl(item.image)! }} style={styles.thumbImg} />
              ) : (
                <Package size={16} color="#9ca3af" />
              )}
            </View>
            <View style={styles.cardItemInfo}>
              <Text style={styles.cardItemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardItemQty}>Qty: {item.quantity} x {formatAmount(item.sellingPrice)}</Text>
            </View>
            <Text style={styles.cardItemSubtotal}>{formatAmount(item.sellingPrice * item.quantity)}</Text>
          </View>
        ))}
        {itemCount > 3 && (
          <Text style={styles.moreItems}>+{itemCount - 3} more item{itemCount - 3 !== 1 ? "s" : ""}</Text>
        )}
      </View>

      {/* Bottom row – payment + total */}
      <View style={styles.cardBottom}>
        <View style={[styles.payPill, { backgroundColor: payCfg.bg }]}>
          <CreditCard size={12} color={payCfg.color} />
          <Text style={[styles.payPillText, { color: payCfg.color }]}>{payCfg.label}</Text>
        </View>
        {order.balance > 0 && <Text style={styles.balanceText}>Bal: {formatAmount(order.balance)}</Text>}
        <View style={styles.cardTotalWrap}>
          <Text style={styles.cardTotalLabel}>Total</Text>
          <Text style={styles.cardTotalValue}>{formatAmount(order.total)}</Text>
        </View>
      </View>

      {/* Chevron hint */}
      <ChevronRight size={16} color="#d1d5db" style={styles.cardChevron} />
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1, backgroundColor: "#f9fafb" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  iconBtn: { width: 40, alignItems: "center", padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },

  // Loading
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 15, color: "#6b7280" },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", padding: 0 },
  clearBtn: { fontSize: 14, color: "#059669", fontWeight: "600" },

  // Summary bar
  summaryBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryStat: { flex: 1, alignItems: "center" },
  summaryCount: { fontSize: 20, fontWeight: "700", color: "#111827" },
  summaryLabel: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: "#e5e7eb" },

  // List
  list: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingBottom: 24 },

  // Empty state
  emptyState: { alignItems: "center", paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#374151", marginTop: 16 },
  emptySub: { fontSize: 14, color: "#9ca3af", marginTop: 6, textAlign: "center" },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardChevron: { position: "absolute", right: 16, top: 18 },

  // Card top
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIdRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardId: { fontSize: 14, fontWeight: "700", color: "#111827" },
  cardDateBadge: { backgroundColor: "#f3f4f6", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  cardDate: { fontSize: 11, color: "#6b7280", fontWeight: "500" },

  // Status pill
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  statusPillText: { fontSize: 12, fontWeight: "600" },

  // Items
  cardItems: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 10, marginBottom: 12 },
  cardItemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardItemThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  thumbImg: { width: 36, height: 36, borderRadius: 8 },
  cardItemInfo: { flex: 1 },
  cardItemName: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  cardItemQty: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  cardItemSubtotal: { fontSize: 13, fontWeight: "700", color: "#374151" },
  moreItems: { fontSize: 12, color: "#059669", fontWeight: "600", textAlign: "center", marginTop: 2 },

  // Bottom
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 10 },
  payPill: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  payPillText: { fontSize: 11, fontWeight: "600" },
  balanceText: { fontSize: 12, color: "#dc2626", fontWeight: "600" },
  cardTotalWrap: { marginLeft: "auto", alignItems: "flex-end" },
  cardTotalLabel: { fontSize: 11, color: "#9ca3af" },
  cardTotalValue: { fontSize: 15, fontWeight: "800", color: "#059669" },
});
