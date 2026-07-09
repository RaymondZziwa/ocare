import { useRouter } from "expo-router";
import { Check, Loader2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useCart from "@/hooks/useCart";
import { apiRequest } from "@/libs/apiConfig";
import { useAuth } from "@/context/AuthContext";
import { SALESENDPOINTS } from "@/endpoints/sales/salesEndpoints";

const airtelLogo = require("../assets/images/airtel.jpeg");
const mtnLogo = require("../assets/images/mtn.png");

type PaymentMethod = "airtel" | "mtn" | null;
type PaymentStatus = "idle" | "initiating" | "pending" | "success" | "failed";

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items: cartItems, total, clearCartItems } = useCart();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActive = useRef(true);

  // Calculate tax (18% VAT in Uganda)
  const taxRate = 0.18;
  const tax = total * taxRate;
  const totalWithTax = total + tax;

  // Stop all polling and timeouts
  const stopPolling = () => {
    isPollingActive.current = false;

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  // Poll payment status
  const pollPaymentStatus = useCallback(async (paymentRef: string) => {
    if (!isPollingActive.current) return;

    try {
      const endpoint = SALESENDPOINTS.POS.PING_PAYMENT_STATUS(paymentRef);
      const response = await apiRequest(endpoint, "GET", "");

      console.log("Payment status response:", response);

      if (response?.data?.status === "COMPLETED") {
        console.log("Payment completed! Stopping polling...");
        stopPolling();
        setPaymentStatus("success");
        clearCartItems();

        setTimeout(() => {
          router.replace("/(tabs)" as any);
        }, 1000);
        return;
      }

      if (response?.data?.status === "FAILED") {
        console.log("Payment failed! Stopping polling...");
        stopPolling();
        setPaymentStatus("failed");
        return;
      }

      if (response?.data?.status === "PENDING") {
        console.log("Payment still pending...");
      }
    } catch (error) {
      console.error("Error polling payment status:", error);
    }
  }, [router, clearCartItems]);

  // Start polling and timeout
  const startPolling = useCallback((paymentRef: string) => {
    isPollingActive.current = true;

    const interval = setInterval(() => {
      if (paymentRef && isPollingActive.current) {
        pollPaymentStatus(paymentRef);
      }
    }, 3000);

    pollingIntervalRef.current = interval;

    const timeout = setTimeout(() => {
      if (paymentStatus === "pending" && isPollingActive.current) {
        console.log("Payment timeout! Stopping polling...");
        stopPolling();
        setPaymentStatus("failed");
        Alert.alert("Payment Timeout", "The payment took too long to complete. Please try again.");
      }
    }, 300000); // 5 minutes timeout

    timeoutIdRef.current = timeout;
  }, [paymentStatus, pollPaymentStatus]);

  useEffect(() => {
    if (paymentStatus === "pending" && transactionId) {
      console.log("Starting polling for reference:", transactionId);
      startPolling(transactionId);
    }

    return () => {
      stopPolling();
    };
  }, [paymentStatus, transactionId, startPolling]);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    
    // If number starts with 0, replace with +256
    if (cleaned.startsWith("0")) {
      return "+256" + cleaned.slice(1);
    }
    
    // If number starts with 256, add + prefix
    if (cleaned.startsWith("256")) {
      return "+" + cleaned;
    }
    
    // If number is 9 digits (Uganda format without country code), add +256
    if (cleaned.length === 9) {
      return "+256" + cleaned;
    }
    
    // Otherwise, just add + if it doesn't have it
    if (cleaned.length > 0 && !cleaned.startsWith("+")) {
      return "+" + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const initiatePayment = async () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (!phoneNumber || phoneNumber.length < 12) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    setIsLoading(true);
    setPaymentStatus("initiating");

    try {
      const payload = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice || item.price,
          unitId: item.unitId,
        })),
        total,
        totalWithCharges: totalWithTax,
        paymentMethods: [
          {
            type: selectedMethod === "airtel" ? "AIRTEL_MOMO" : "MTN_MOMO",
            amount: totalWithTax,
          },
        ],
        phoneNumber,
        storeId: "default-store", // TODO: Get from context
        customerId: user?.id || "mobile-user",
        servedBy: "mobile-app",
        status: "UNPAID",
        balance: 0,
      };

      const response = await apiRequest("/api/orders/place-order", "POST", "", payload);
      
      if ((response as any)?.status === 200 || (response as any)?.status === 201) {
        const data = (response as any).data;
        setTransactionId(data.transaction?.reference || data.sale?.id);
        setPaymentStatus("pending");
      } else {
        setPaymentStatus("failed");
        Alert.alert("Payment Failed", (response as any)?.message || "Failed to initiate payment");
      }
    } catch (error: any) {
      setPaymentStatus("failed");
      console.error("Payment error:", error);
      Alert.alert("Payment Failed", error?.message || "An error occurred while initiating payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setPaymentStatus("idle");
    setTransactionId(null);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{cartItems.length}</Text>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>UGX {total.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Tax (18%)</Text>
            <Text style={styles.summaryValue}>UGX {tax.toLocaleString()}</Text>
            <View style={styles.divider} />
            <Text style={styles.summaryLabelBold}>Total Amount</Text>
            <Text style={styles.summaryValueBold}>UGX {totalWithTax.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedMethod === "airtel" && styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedMethod("airtel")}
          >
            <View style={styles.paymentMethodContent}>
              <Image source={airtelLogo} style={styles.paymentLogo} resizeMode="contain" />
              <Text style={styles.paymentMethodName}>Airtel Money</Text>
            </View>
            {selectedMethod === "airtel" && <Check size={20} color="#ffffff" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedMethod === "mtn" && styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedMethod("mtn")}
          >
            <View style={styles.paymentMethodContent}>
              <Image source={mtnLogo} style={styles.paymentLogo} resizeMode="contain" />
              <Text style={styles.paymentMethodName}>MTN Mobile Money</Text>
            </View>
            {selectedMethod === "mtn" && <Check size={20} color="#ffffff" />}
          </TouchableOpacity>
        </View>

        {/* Phone Number Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="+256 7XX XXX XXX"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={13}
          />
          <Text style={styles.helperText}>
            Enter your mobile money number. Format: +256 7XX XXX XXX
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, (!selectedMethod || !phoneNumber || isLoading) && styles.payButtonDisabled]}
          onPress={initiatePayment}
          disabled={!selectedMethod || !phoneNumber || isLoading || paymentStatus !== "idle"}
        >
          {isLoading ? (
            <Loader2 size={20} color="#ffffff" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay UGX {totalWithTax.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Payment Status Modal */}
      {paymentStatus !== "idle" && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {paymentStatus === "initiating" && (
              <>
                <Loader2 size={48} color="#1da250" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Initiating Payment</Text>
                <Text style={styles.modalText}>
                  Please wait while we initiate your mobile money payment...
                </Text>
              </>
            )}

            {paymentStatus === "pending" && (
              <>
                <Loader2 size={48} color="#1da250" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Payment Pending</Text>
                <Text style={styles.modalText}>
                  Please check your phone and enter your PIN to complete the payment.
                </Text>
                <Text style={styles.modalSubtext}>
                  Transaction ID: {transactionId}
                </Text>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={handleCancelPayment}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {paymentStatus === "success" && (
              <>
                <Check size={48} color="#1da250" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Payment Successful!</Text>
                <Text style={styles.modalText}>
                  Your payment has been completed successfully.
                </Text>
              </>
            )}

            {paymentStatus === "failed" && (
              <>
                <X size={48} color="#dc2626" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Payment Failed</Text>
                <Text style={styles.modalText}>
                  Your payment could not be completed. Please try again.
                </Text>
                <TouchableOpacity
                  style={styles.modalRetryButton}
                  onPress={handleCancelPayment}
                >
                  <Text style={styles.modalRetryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  summaryValueBold: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1da250",
    marginBottom: 4,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodSelected: {
    borderColor: "#1da250",
    backgroundColor: "#ecfdf3",
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  airtelIcon: {
    backgroundColor: "#ed1c24",
  },
  mtnIcon: {
    backgroundColor: "#ffcc00",
  },
  paymentIconText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  paymentLogo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  phoneInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
  },
  payButton: {
    backgroundColor: "#1da250",
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    width: "85%",
    maxWidth: 360,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 16,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalRetryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#1da250",
  },
  modalRetryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
