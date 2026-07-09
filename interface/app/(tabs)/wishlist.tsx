import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingCart, ChevronLeft, Trash2 } from 'lucide-react-native';
import BottomNavigation from '../../components/BottomNavigation';

export default function WishlistScreen() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: '1',
      name: 'Amoxicillin 500mg',
      price: 48000,
      image: 'https://via.placeholder.com/80x80',
      description: 'Antibiotic for bacterial infections',
      inStock: true,
    },
    {
      id: '2',
      name: 'Vitamin D3 1000IU',
      price: 59000,
      image: 'https://via.placeholder.com/80x80',
      description: 'Supports bone health and immune system',
      inStock: true,
    },
    {
      id: '3',
      name: 'NyQuil Cold & Flu',
      price: 41000,
      image: 'https://via.placeholder.com/80x80',
      description: 'Multi-symptom cold and flu relief',
      inStock: false,
    },
    {
      id: '4',
      name: 'Band-Aid Variety Pack',
      price: 26000,
      image: 'https://via.placeholder.com/80x80',
      description: 'Assorted bandage sizes for minor cuts',
      inStock: true,
    },
  ]);

  const handleRemoveFromWishlist = (itemId: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => {
          setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        }}
      ]
    );
  };

  const handleAddToCart = (item: any) => {
    if (!item.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }
    
    Alert.alert(
      'Added to Cart',
      `${item.name} has been added to your cart`,
      [
        { text: 'OK', onPress: () => {
          // Remove from wishlist after adding to cart
          setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id));
        }}
      ]
    );
  };

  const handleAddAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock);
    
    if (inStockItems.length === 0) {
      Alert.alert('No Items', 'No items in stock to add to cart');
      return;
    }

    Alert.alert(
      'Add All to Cart',
      `Add ${inStockItems.length} items to your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add All', onPress: () => {
          // Clear wishlist after adding to cart
          setWishlistItems([]);
        }}
      ]
    );
  };

  const WishlistItem = ({ item }: { item: any }) => (
    <View style={styles.wishlistItem}>
      <View style={styles.itemImageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.itemPrice}>UGX {item.price.toLocaleString()}</Text>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => handleRemoveFromWishlist(item.id)}
        >
          <Trash2 size={16} color="#dc2626" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !item.inStock && styles.addToCartButtonDisabled
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={!item.inStock}
        >
          <ShoppingCart size={16} color={item.inStock ? "#ffffff" : "#9ca3af"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>My Wishlist</Text>
          <View style={styles.wishlistIcon}>
            <Heart size={24} color="#dc2626" fill="#dc2626" />
            <View style={styles.wishlistBadge}>
              <Text style={styles.wishlistBadgeText}>{wishlistItems.length}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {wishlistItems.length === 0 ? (
            <View style={styles.emptyWishlist}>
              <Heart size={64} color="#9ca3af" />
              <Text style={styles.emptyWishlistTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptyWishlistDescription}>
                Save medicines you love for later
              </Text>
              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => router.push('/(tabs)/store' as any)}
              >
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={styles.addAllButton}
                  onPress={handleAddAllToCart}
                >
                  <ShoppingCart size={16} color="#ffffff" />
                  <Text style={styles.addAllButtonText}>Add All to Cart</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemsSection}>
                {wishlistItems.map((item) => (
                  <WishlistItem key={item.id} item={item} />
                ))}
              </View>

              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>You might also like</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 3].map((item) => (
                    <View key={item} style={styles.recommendationCard}>
                      <View style={styles.recommendationImage}>
                        <Text style={styles.placeholderText}>📦</Text>
                      </View>
                      <Text style={styles.recommendationName}>Recommended Item {item}</Text>
                      <Text style={styles.recommendationPrice}>UGX 35,000</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </ScrollView>

        <BottomNavigation activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  wishlistIcon: {
    position: 'relative',
  },
  wishlistBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyWishlist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyWishlistTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyWishlistDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: '#1da250',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsSection: {
    marginBottom: 16,
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1da250',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addAllButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 24,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  outOfStockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  outOfStockText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1da250',
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  wishlistButton: {
    padding: 8,
  },
  addToCartButton: {
    backgroundColor: '#1da250',
    padding: 8,
    borderRadius: 6,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  recommendationCard: {
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  recommendationImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1da250',
  },
});
