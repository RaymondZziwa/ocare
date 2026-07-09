import { useRouter, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  Package,
  Truck,
  XCircle,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { baseURL } from "@/libs/apiConfig";
import type { OrderItem, SaleStatus, PaymentStatus } from "@/services/profileService";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_STEPS: { status: SaleStatus; label: string; icon: any }[] = [
  { status: "PENDING", label: "Order Placed", icon: Clock },
  { status: "PACKAGING", label: "Packaging", icon: Package },
  { status: "IN_DELIVERY", label: "In Delivery", icon: Truck },
  { status: "SUCCESSFUL", label: "Delivered", icon: CheckCircle2 },
];

const FAILED_STATUSES: SaleStatus[] = ["FAILED", "CANCELLED"];

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UNPAID: { label: "Unpaid", color: "#dc2626", bg: "#fef2f2" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "#d97706", bg: "#fffbeb" },
  FULLY_PAID: { label: "Paid", color: "#059669", bg: "#ecfdf5" },
};

const getStatusColor = (status: SaleStatus) => {
  switch (status) {
    case "PENDING": return "#d97706";
    case "PACKAGING": return "#2563eb";
    case "IN_DELIVERY": return "#7c3aed";
    case "SUCCESSFUL": return "#059669";
    case "FAILED": return "#dc2626";
    case "CANCELLED": return "#6b7280";
    default: return "#6b7280";
  }
};

const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const clean = url.startsWith("/") ? url.slice(1) : url;
  return `${baseURL}/${clean}`;
};

const formatAmount = (amount: number) => `UGX ${amount}`;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId: string;
    saleStatus: SaleStatus;
    paymentStatus: PaymentStatus;
    total: string;
    balance: string;
    type: string;
    createdAt: string;
    items: string;
  }>();

  // Build order from route params – no API call
  const order = useMemo(() => {
    if (!params.orderId) return null;
    try {
      return {
        id: params.orderId,
        saleStatus: params.saleStatus as SaleStatus,
        paymentStatus: params.paymentStatus as PaymentStatus,
        total: Number(params.total) || 0,
        balance: Number(params.balance) || 0,
        type: params.type || "",
        createdAt: params.createdAt || new Date().toISOString(),
        items: params.items ? (JSON.parse(params.items) as OrderItem[]) : [],
      };
    } catch {
      return null;
    }
  }, [params]);

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <XCircle size={64} color="#dc2626" />
          <Text style={styles.errorTitle}>Order not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepIndex =
    order.saleStatus === "SUCCESSFUL"
      ? STATUS_STEPS.length - 1
      : STATUS_STEPS.findIndex((s) => s.status === order.saleStatus);

  const isFailed = FAILED_STATUSES.includes(order.saleStatus);
  const payCfg = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG.UNPAID;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Summary ─────────────────────────────────────────────────── */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.orderId}>
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.saleStatus) }]}>
                <Text style={styles.statusBadgeText}>{order.saleStatus.replace("_", " ")}</Text>
              </View>
            </View>

            <View style={styles.summaryTotals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatAmount(order.total)}</Text>
              </View>
              {order.balance > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Balance Due</Text>
                  <Text style={[styles.totalValue, { color: "#dc2626" }]}>{formatAmount(order.balance)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Timeline ─────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            {isFailed ? (
              <View style={styles.failedCard}>
                <AlertCircle size={48} color="#dc2626" />
                <Text style={styles.failedTitle}>
                  {order.saleStatus === "CANCELLED" ? "Order Cancelled" : "Order Failed"}
                </Text>
                <Text style={styles.failedSub}>
                  {order.saleStatus === "CANCELLED"
                    ? "This order has been cancelled"
                    : "This order could not be processed"}
                </Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <View key={step.status} style={styles.timelineStep}>
                      <View style={styles.timelineContent}>
                        <View
                          style={[
                            styles.timelineDot,
                            isCompleted && styles.timelineDotDone,
                            isCurrent && styles.timelineDotCurrent,
                          ]}
                        >
                          <Icon size={18} color={isCompleted ? "#fff" : "#9ca3af"} />
                        </View>
                        <Text
                          style={[
                            styles.timelineLabel,
                            isCompleted && styles.timelineLabelDone,
                            isCurrent && styles.timelineLabelCurrent,
                          ]}
                        >
                          {step.label}
                        </Text>
                      </View>
                      {index < STATUS_STEPS.length - 1 && (
                        <View style={[styles.timelineLine, isCompleted && styles.timelineLineDone]} />
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Items ────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
            <View style={styles.itemsCard}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemThumb}>
                    {item.image && getFullImageUrl(item.image) ? (
                      <Image source={{ uri: getFullImageUrl(item.image)! }} style={styles.itemThumbImg} />
                    ) : (
                      <Package size={22} color="#9ca3af" />
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{item.quantity} x {formatAmount(item.sellingPrice)}</Text>
                  </View>
                  <Text style={styles.itemTotal}>{formatAmount(item.sellingPrice * item.quantity)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Payment ───────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Status</Text>
                <View style={[styles.payPill, { backgroundColor: payCfg.bg }]}>
                  <CreditCard size={14} color={payCfg.color} />
                  <Text style={[styles.payPillText, { color: payCfg.color }]}>{payCfg.label}</Text>
                </View>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Order Type</Text>
                <Text style={styles.paymentValue}>{order.type.replace("_", " ")}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
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

  // Content
  content: { flex: 1, padding: 16 },

  // Error
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorTitle: { fontSize: 20, fontWeight: "600", color: "#1f2937", marginTop: 16, marginBottom: 24 },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, fontWeight: "600", color: "#059669" },

  // Section
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },

  // Summary
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  orderId: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  orderDate: { fontSize: 13, color: "#6b7280" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  summaryTotals: { borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalLabel: { fontSize: 14, color: "#6b7280" },
  totalValue: { fontSize: 16, fontWeight: "700", color: "#111827" },

  // Failed
  failedCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  failedTitle: { fontSize: 18, fontWeight: "600", color: "#dc2626", marginTop: 12, marginBottom: 4 },
  failedSub: { fontSize: 14, color: "#6b7280", textAlign: "center" },

  // Timeline
  timeline: { backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb" },
  timelineStep: { flexDirection: "row", alignItems: "flex-start" },
  timelineContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  timelineDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotDone: { backgroundColor: "#059669" },
  timelineDotCurrent: { backgroundColor: "#059669", borderWidth: 3, borderColor: "#bbf7d0" },
  timelineLabel: { fontSize: 14, color: "#9ca3af", marginLeft: 12, fontWeight: "500" },
  timelineLabelDone: { color: "#1f2937" },
  timelineLabelCurrent: { color: "#059669", fontWeight: "600" },
  timelineLine: { width: 2, height: 28, backgroundColor: "#e5e7eb", marginLeft: 19 },
  timelineLineDone: { backgroundColor: "#059669" },

  // Items
  itemsCard: { backgroundColor: "#fff", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  itemThumbImg: { width: 48, height: 48, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  itemMeta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  itemTotal: { fontSize: 15, fontWeight: "700", color: "#059669" },

  // Payment
  paymentCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  paymentLabel: { fontSize: 14, color: "#6b7280" },
  paymentValue: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  payPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  payPillText: { fontSize: 12, fontWeight: "600" },
});
