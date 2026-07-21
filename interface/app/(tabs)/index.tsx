import useItemCategories from "@/hooks/useItemCategories";
import useItems from "@/hooks/useItems";
import useBanners from "@/hooks/useBanners";
import { baseURL } from "@/libs/apiConfig";
import { useRouter } from "expo-router";
import { Heart, Plus, RefreshCw, Search, ShoppingCart, Bell } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavigation from "../../components/BottomNavigation";
import useCart from "@/hooks/useCart";
import { toast } from "sonner-native";

// Helper function to get full image URL
const getFullImageUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return null;

  // If it's already a full URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Remove leading slash to avoid double slashes
  const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;

  // Combine base URL with image path
  return `${baseURL}/${cleanPath}`;
};

export default function StoreScreen() {
  const router = useRouter();
  const { data: categories, refresh: refreshCategories } = useItemCategories();
  const { data: medicines, refresh: refreshItems } = useItems();
  //const { data: banners } = useBanners();
  const { addItem, count: cartCount } = useCart(); // Use the useCart hook
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([refreshCategories(), refreshItems()]);
    setIsRefreshing(false);
  }, [refreshCategories, refreshItems]);

  const handleAddToCart = (medicine: any) => {
    console.log("Adding to cart:", medicine);
    addItem({
      id: medicine.id,
      name: medicine.name,
      sellingPrice: medicine.sellingPrice,
      image: medicine.image || null,
      unitId: medicine.unitId,
      description: `Category: ${medicine.category?.name || "Unknown"}`,
    });
    toast.success("Item has been added to your cart");
  };

  const handleAddToWishlist = (medicineId: string) => {
    setWishlistCount((prev) => prev + 1);
    toast.success("Item has been added to your wishlist");
  };

  const handleCart = () => {
    router.push("/(tabs)/cart" as any);
  };

  const handleNotifications = () => {
    router.push("/(tabs)/notifications" as any);
  };

  const handleWishlist = () => {
    router.push("/(tabs)/wishlist" as any);
  };

  // Filter medicines based on search query AND selected category
  const filteredMedicines = medicines.filter((medicine) => {
    // Check search match
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (medicine.category?.name &&
        medicine.category.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    // Check category match
    const matchesCategory =
      selectedCategory === "all" ||
      medicine.category?.id.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get popular items (if you have an isPopular flag)
  const popularItems = medicines.filter(
    (medicine: any) =>
      medicine.isPopular &&
      (selectedCategory === "all" ||
        medicine.category?.id.toString() === selectedCategory),
  );

  // Regular items are the filtered ones that are not popular
  const regularItems = filteredMedicines.filter(
    (medicine: any) => !medicine.isPopular,
  );

  const MedicineCard = ({ medicine }: { medicine: any }) => {
    // Get full image URL (IItem doesn't have imageUrl, so this will be null)
    const imageSource = getFullImageUrl(medicine.image || null);

    return (
      <TouchableOpacity
        style={styles.medicineCard}
        onPress={() => router.push(("/(tabs)/store/" + medicine.id) as any)}
      >
        <View style={styles.cardImageContainer}>
          <View style={styles.imagePlaceholder}>
            {imageSource ? (
              <Image
                source={{ uri: imageSource }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.placeholderText}>📦</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToWishlist(medicine.id);
            }}
          >
            <Heart size={16} color="#dc2626" fill="#dc2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDescription} numberOfLines={2}>
            Category: {medicine.category?.name || "Unknown"}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              UGX {medicine.sellingPrice.toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(medicine);
              }}
            >
              <Plus size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search medicines..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.headerIcons}>
              {/* <TouchableOpacity
                style={styles.iconButton}
                onPress={onRefresh}
              >
                <RefreshCw size={20} color={isRefreshing ? "#1da250" : "#1f2937"} />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleNotifications}
              >
                <Bell size={20} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleWishlist}
              >
                <Heart size={20} color="#1f2937" />
                {wishlistCount > 0 && (
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterText}>{wishlistCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleCart}>
                <ShoppingCart size={20} color="#1f2937" />
                {cartCount > 0 && (
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner Carousel */}
          {/* {banners && banners.length > 0 ? (
            <View style={styles.bannerCarousel}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                style={styles.bannerScroll}
              >
                {banners.map((banner: any) => (
                  <View
                    key={banner.id}
                    style={[styles.bannerItem, { backgroundColor: banner.backgroundColor || '#1da250' }]}
                  >
                    {banner.imageUrl && (() => {
                      const imageUrl = getFullImageUrl(banner.imageUrl);
                      return imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.bannerImage}
                          resizeMode="cover"
                        />
                      ) : null;
                    })()}
                    <View style={styles.bannerContent}>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      {banner.subtitle && (
                        <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null} */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {/* All Categories Button */}
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === "all" && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === "all" && styles.categoryTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {/* Dynamic Categories from API */}
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id.toString() &&
                    styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.id.toString())}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id.toString() &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#1da250"
              colors={["#1da250"]}
              title="Pull to refresh"
              titleColor="#6b7280"
            />
          }
        >
          {popularItems.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Items</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {popularItems.map((medicine) => (
                  <View key={medicine.id} style={styles.horizontalCard}>
                    <MedicineCard medicine={medicine} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {regularItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === "all"
                  ? "All Medicines"
                  : `Medicines in ${categories?.find((c) => c.id.toString() === selectedCategory)?.name || "Selected Category"}`}
              </Text>

              <View style={styles.gridContainer}>
                {regularItems.map((medicine) => (
                  <View key={medicine.id} style={styles.gridCard}>
                    <MedicineCard medicine={medicine} />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No medicines found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No results for "${searchQuery}" in ${selectedCategory === "all" ? "all categories" : categories?.find((c) => c.id.toString() === selectedCategory)?.name}`
                  : `No medicines available in ${selectedCategory === "all" ? "this category" : categories?.find((c) => c.id.toString() === selectedCategory)?.name}`}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <BottomNavigation activeTab="home" />
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 12,
  },
  filterButton: {
    padding: 8,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    position: "relative",
    padding: 8,
  },
  counterBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#1da250",
  },
  categoryText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  seeAllText: {
    fontSize: 14,
    color: "#1da250",
    fontWeight: "500",
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  horizontalCard: {
    width: 200,
    marginRight: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  medicineCard: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImageContainer: {
    position: "relative",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 32,
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#1f2937",
    fontWeight: "500",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1da250",
  },
  addToCartButton: {
    backgroundColor: "#1da250",
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerCarousel: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  bannerScroll: {
    borderRadius: 12,
  },
  bannerItem: {
    width: 300,
    height: 140,
    backgroundColor: "#1da250",
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  bannerItem2: {
    backgroundColor: "#15803d",
  },
  bannerContent: {
    padding: 20,
    alignItems: "center",
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
  },
});
