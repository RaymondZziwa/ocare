import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Heart, 
  Plus, 
  Minus, 
  Star, 
  Share2, 
  Shield, 
  Clock, 
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react-native';
import BottomNavigation from '../../../components/BottomNavigation';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedSize, setSelectedSize] = useState('500mg');

  const product = {
    id: '1',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    brand: 'MediCare Pharma',
    price: 48000,
    originalPrice: 55000,
    image: 'https://via.placeholder.com/300x300',
    rating: 4.5,
    reviews: 234,
    description: 'Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and other infections.',
    category: 'Prescription Medicine',
    prescriptionRequired: true,
    inStock: true,
    discount: 15,
    manufacturer: 'MediCare Pharmaceuticals Ltd',
    expiryDate: '2025-12-31',
    batchNumber: 'AMX-2024-001',
    storageConditions: 'Store below 25°C. Protect from light and moisture.',
    sideEffects: [
      'Nausea',
      'Vomiting',
      'Diarrhea',
      'Stomach upset',
      'Skin rash'
    ],
    dosage: {
      adults: '250-500mg every 8 hours',
      children: '20-50mg/kg/day in divided doses',
      duration: '7-10 days or as prescribed by doctor'
    },
    contraindications: [
      'Known penicillin allergy',
      'Severe kidney disease',
      'History of Clostridium difficile infection'
    ],
    interactions: [
      'Allopurinol',
      'Probenecid',
      'Methotrexate',
      'Warfarin'
    ],
    ingredients: {
      active: 'Amoxicillin Trihydrate 500mg',
      inactive: 'Microcrystalline cellulose, magnesium stearate, sodium starch glycolate'
    },
    packaging: '10 tablets per strip, 10 strips per box',
    sizes: ['250mg', '500mg', '875mg']
  };

  const handleAddToCart = () => {
    Alert.alert(
      'Added to Cart',
      `${product.name} (${selectedSize}) x${quantity} has been added to your cart`,
      [
        { text: 'Continue Shopping', onPress: () => router.back() },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart' as any) }
      ]
    );
  };

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    Alert.alert(
      isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
      `${product.name} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist`
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.name} on OCare Pharmacy - UGX ${product.price.toLocaleString()}`,
        title: product.name
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share product');
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + change));
    setQuantity(newQuantity);
  };

  const calculateTotalPrice = () => {
    const basePrice = selectedSize === '250mg' ? 35000 : selectedSize === '500mg' ? 48000 : 65000;
    return basePrice * quantity;
  };

  const InfoSection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <View style={styles.infoSection}>
      <View style={styles.infoHeader}>
        {icon}
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <View style={styles.infoContent}>
        {children}
      </View>
    </View>
  );

  const BulletList = ({ items }: { items: string[] }) => (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Product Details</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Share2 size={20} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.productImageContainer}>
            <View style={styles.productImage}>
              <Text style={styles.placeholderText}>💊</Text>
            </View>
            {product.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )}
            <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlist}>
              <Heart 
                size={20} 
                color={isInWishlist ? "#dc2626" : "#6b7280"} 
                fill={isInWishlist ? "#dc2626" : "none"} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <View style={styles.productNameContainer}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.genericName}>{product.genericName}</Text>
              </View>
              <View style={styles.brandContainer}>
                <Text style={styles.brand}>by {product.brand}</Text>
              </View>
            </View>

            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    color={i < Math.floor(product.rating) ? "#f59e0b" : "#e5e7eb"} 
                    fill={i < Math.floor(product.rating) ? "#f59e0b" : "none"} 
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
            </View>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>UGX {calculateTotalPrice().toLocaleString()}</Text>
                {product.discount > 0 && (
                  <Text style={styles.originalPrice}>UGX {product.originalPrice.toLocaleString()}</Text>
                )}
              </View>
              <Text style={styles.pricePerUnit}>per {quantity} {quantity === 1 ? 'tablet' : 'tablets'}</Text>
            </View>

            <View style={styles.sizeContainer}>
              <Text style={styles.sizeLabel}>Strength:</Text>
              <View style={styles.sizeOptions}>
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      selectedSize === size && styles.sizeOptionSelected
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextSelected
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(-1)}
                >
                  <Minus size={16} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(1)}
                >
                  <Plus size={16} color="#1f2937" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stockContainer}>
              <View style={styles.stockInfo}>
                {product.inStock ? (
                  <>
                    <CheckCircle size={16} color="#1da250" />
                    <Text style={styles.inStockText}>In Stock</Text>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} color="#dc2626" />
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  </>
                )}
              </View>
              {product.prescriptionRequired && (
                <View style={styles.prescriptionBadge}>
                  <Text style={styles.prescriptionText}>Prescription Required</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !product.inStock && styles.addToCartButtonDisabled
              ]}
              onPress={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart size={20} color="#ffffff" />
              <Text style={styles.addToCartText}>
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <InfoSection icon={<Package size={20} color="#1da250" />} title="Product Information">
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{product.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Manufacturer:</Text>
                <Text style={styles.detailValue}>{product.manufacturer}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Batch Number:</Text>
                <Text style={styles.detailValue}>{product.batchNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry Date:</Text>
                <Text style={styles.detailValue}>{product.expiryDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Packaging:</Text>
                <Text style={styles.detailValue}>{product.packaging}</Text>
              </View>
            </InfoSection>


            <InfoSection icon={<AlertCircle size={20} color="#f59e0b" />} title="Important Information">
              <View style={styles.warningSection}>
                <Text style={styles.warningTitle}>Side Effects:</Text>
                <BulletList items={product.sideEffects} />
              </View>
            </InfoSection>

            <InfoSection icon={<Shield size={20} color="#1da250" />} title="Storage & Safety">
              <Text style={styles.storageText}>{product.storageConditions}</Text>
              <View style={styles.safetyInfo}>
                <Text style={styles.safetyTitle}>Keep out of reach of children</Text>
                <Text style={styles.safetySubtitle}>Store in a cool, dry place away from direct sunlight</Text>
              </View>
            </InfoSection>

            {/* <InfoSection icon={<Package size={20} color="#1da250" />} title="Ingredients">
              <View style={styles.ingredientsSection}>
                <Text style={styles.ingredientsTitle}>Active Ingredient:</Text>
                <Text style={styles.ingredientsText}>{product.ingredients.active}</Text>
              </View>
              <View style={styles.ingredientsSection}>
                <Text style={styles.ingredientsTitle}>Inactive Ingredients:</Text>
                <Text style={styles.ingredientsText}>{product.ingredients.inactive}</Text>
              </View>
            </InfoSection> */}

            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          </View>
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
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderText: {
    fontSize: 64,
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  wishlistButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productHeader: {
    marginBottom: 12,
  },
  productNameContainer: {
    marginBottom: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  genericName: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  brandContainer: {
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1da250',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  pricePerUnit: {
    fontSize: 14,
    color: '#6b7280',
  },
  sizeContainer: {
    marginBottom: 16,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  sizeOptionSelected: {
    backgroundColor: '#1da250',
    borderColor: '#1da250',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  sizeTextSelected: {
    color: '#ffffff',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 20,
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inStockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1da250',
    marginLeft: 4,
  },
  outOfStockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    marginLeft: 4,
  },
  prescriptionBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  prescriptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1da250',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#1da250',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  infoContent: {
    paddingLeft: 28,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  dosageSection: {
    marginBottom: 12,
  },
  dosageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  dosageText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  warningSection: {
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 8,
  },
  bulletList: {
    paddingLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    flex: 1,
  },
  storageText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  safetyInfo: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  safetySubtitle: {
    fontSize: 12,
    color: '#92400e',
  },
  ingredientsSection: {
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ingredientsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
