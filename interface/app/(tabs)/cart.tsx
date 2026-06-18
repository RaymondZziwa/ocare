import useCart from "@/hooks/useCart";
import { baseURL } from "@/libs/apiConfig";
import { useRouter } from "expo-router";
import {
    ChevronLeft,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavigation from "../../components/BottomNavigation";

export default function CartScreen() {
  const router = useRouter();
  const { items: cartItems, updateItemQuantity, removeItem, total } = useCart();

  // Log cart items whenever they change
  useEffect(() => {
    console.log("=== CART ITEMS DEBUG ===");
    console.log("Total items in cart:", cartItems.length);
    console.log("Cart items:", JSON.stringify(cartItems, null, 2));
    console.log("Cart total:", total);
    console.log("======================");
  }, [cartItems, total]);

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      console.log(`Updating quantity for item ${itemId}: ${item.quantity} -> ${newQuantity}`);
      updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const item = cartItems.find((i) => i.id === itemId);
    console.log(`Attempting to remove item: ${item?.name} (${itemId})`);
    
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove ${item?.name} from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            console.log(`Removing item: ${itemId}`);
            removeItem(itemId);
          },
        },
      ],
    );
  };

  const calculateSubtotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.sellingPrice* item.quantity,
      0,
    );
    console.log("Calculated subtotal:", subtotal);
    return subtotal;
  };

  const calculateTax = () => {
    const tax = Math.round(calculateSubtotal() * 0.075); // 18% VAT
    console.log("Calculated tax (18%):", tax);
    return tax;
  };

  const calculateTotal = () => {
    const total = calculateSubtotal() + calculateTax();
    console.log("Calculated total:", total);
    return total;
  };

  const handleCheckout = () => {
    console.log("Proceeding to checkout with items:", cartItems.length);
    console.log("Checkout details:", {
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.sellingPrice,
        total: item.sellingPrice* item.quantity
      })),
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      grandTotal: calculateTotal()
    });
    Alert.alert("Checkout", "Proceeding to checkout...");
  };

  const CartItem = ({ item }: { item: any }) => {
    const getFullImageUrl = (imageUrl: string | null | undefined) => {
      if (!imageUrl) return null;

      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
      }

      const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
      return `${baseURL}/${cleanPath}`;
    };

    const imageSource = getFullImageUrl(item.image);
    
    // Log individual item details
    console.log(`Rendering cart item: ${item.name}`, {
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      total: item.sellingPrice* item.quantity,
      imageUrl: item.image,
      fullImageUrl: imageSource
    });

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          <View style={styles.imagePlaceholder}>
            {imageSource ? (
              <Image
                source={{ uri: imageSource }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.placeholderText}>📦</Text>
            )}
          </View>
        </View>

        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription} numberOfLines={1}>
            {item.description || "No description"}
          </Text>
          <Text style={styles.itemPrice}>
            UGX {parseFloat(item.sellingPrice).toLocaleString()}
          </Text>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, -1)}
            >
              <Minus size={16} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, 1)}
            >
              <Plus size={16} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Shopping Cart</Text>
          <View style={styles.cartIcon}>
            <ShoppingCart size={24} color="#1da250" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <ShoppingCart size={64} color="#9ca3af" />
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartDescription}>
                Add some medicines to get started
              </Text>
              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => router.push("/(tabs)/store" as any)}
              >
                <Text style={styles.continueShoppingText}>
                  Continue Shopping
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.itemsSection}>
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Order Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    UGX {calculateSubtotal().toLocaleString()}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (7.5%)</Text>
                  <Text style={styles.summaryValue}>
                    UGX {calculateTax().toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    UGX {calculateTotal().toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.checkoutSection}>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                >
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout (UGX {calculateTotal().toLocaleString()}
                    )
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        <BottomNavigation activeTab="store" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  cartIcon: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: "#1da250",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  itemsSection: {
    marginBottom: 24,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1da250",
  },
  itemActions: {
    alignItems: "flex-end",
  },
  removeButton: {
    padding: 8,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    paddingHorizontal: 16,
  },
  summarySection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1da250",
  },
  checkoutSection: {
    marginBottom: 20,
  },
  checkoutButton: {
    backgroundColor: "#1da250",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1da250",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});