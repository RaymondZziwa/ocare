import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Heart, 
  Plus, 
  Minus, 
  Share2, 
  Shield, 
  Package,
  AlertCircle,
  CheckCircle,
  Pill,
  AlertTriangle,
  FlaskConical,
  Store,
  Hash,
  Box,
} from 'lucide-react-native';
import BottomNavigation from '../../../components/BottomNavigation';
import useItems from '@/hooks/useItems';
import useCart from '@/hooks/useCart';
import { baseURL } from '@/libs/apiConfig';
import { toast } from 'sonner-native';

// Helper: get full image URL
const getFullImageUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return `${baseURL}/${cleanPath}`;
};

// Helper: parse JSON fields that may come as stringified JSON
const safeJsonParse = <T,>(value: any, fallback: T): T => {
  if (!value) return fallback;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

interface SideEffect {
  id: string;
  name: string;
  description: string;
  severity: string;
}

interface Variation {
  id: string;
  name: string;
  value: string;
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: items, loading } = useItems();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  // Find the item by ID from the Redux store
  const product = useMemo(() => {
    if (!id || !items?.length) return null;
    return items.find((item: any) => item.id === id) || null;
  }, [id, items]);

  // Parse sideEffects and variations from the API
  const sideEffects = useMemo<SideEffect[]>(() => {
    if (!product) return [];
    return safeJsonParse<SideEffect[]>((product as any).sideEffects, []);
  }, [product]);

  const variations = useMemo<Variation[]>(() => {
    if (!product) return [];
    return safeJsonParse<Variation[]>((product as any).variation, []);
  }, [product]);

  // Image source
  const imageSource = useMemo(() => {
    if (!product) return null;
    return getFullImageUrl((product as any).image || null);
  }, [product]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Product Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.loadingText}>This product could not be found.</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <BottomNavigation activeTab="home" />
      </SafeAreaView>
    );
  }

  // Derive display fields
  const item: any = product;
  const categoryName = item.category?.name || 'Uncategorized';
  const brandName = item.brand?.name || '';
  const unitName = item.unit?.name || 'Unit';
  const unitAbr = item.unit?.abr || '';
  const sellingPrice = Number(item.sellingPrice) || 0;
  const buyingPrice = Number(item.buyingPrice) || 0;
  const description = item.description || 'No description available.';

  const handleAddToCart = () => {
    // If item has variations, require the user to select one first
    if (variations.length > 0 && !selectedVariation) {
      toast.error('Please select a variation/strength first');
      return;
    }

    const selectedVar = variations.find((v) => v.id === selectedVariation);

    const variationLabel = selectedVar
      ? ` (${selectedVar.name}: ${selectedVar.value})`
      : '';

    addItem({
      id: item.id,
      name: item.name,
      sellingPrice,
      image: item.image || null,
      unitId: item.unitId,
      description: `Category: ${categoryName}${variationLabel}`,
      variation: selectedVar
        ? { id: selectedVar.id, name: selectedVar.name, value: selectedVar.value }
        : undefined,
    });

    toast.success(
      `${item.name}${variationLabel} has been added to your cart`
    );
    router.back();
  };

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(
      isInWishlist ? 'Removed from wishlist' : 'Added to wishlist'
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${item.name} on OCare Pharmacy - UGX ${sellingPrice.toLocaleString()}`,
        title: item.name,
      });
    } catch (error) {
      toast.error('Unable to share product');
    }
  };

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + change)));
  };

  const InfoSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <View style={styles.infoSection}>
      <View style={styles.infoHeader}>
        {icon}
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <View style={styles.infoContent}>{children}</View>
    </View>
  );

  const BulletList = ({ items, color = '#6b7280' }: { items: { label?: string; text: string }[]; color?: string }) => (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <View style={[styles.bulletPoint, { backgroundColor: color }]} />
          <Text style={styles.bulletText}>
            {item.label ? <Text style={{ fontWeight: '600' }}>{item.label}: </Text> : null}
            {item.text}
          </Text>
        </View>
      ))}
    </View>
  );

  const severityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return '#f59e0b';
      case 'moderate': return '#f97316';
      case 'severe': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>Product Details</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Share2 size={20} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <View style={styles.productImageContainer}>
            <View style={styles.productImage}>
              {imageSource ? (
                <Image
                  source={{ uri: imageSource }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.placeholderText}>💊</Text>
              )}
            </View>
            <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlist}>
              <Heart
                size={20}
                color={isInWishlist ? '#dc2626' : '#6b7280'}
                fill={isInWishlist ? '#dc2626' : 'none'}
              />
            </TouchableOpacity>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{item.name}</Text>
              {brandName ? (
                <View style={styles.brandRow}>
                  <Store size={14} color="#6b7280" />
                  <Text style={styles.brandText}>{brandName}</Text>
                </View>
              ) : null}
            </View>

            {/* Price */}
            <View style={styles.priceSection}>
              <Text style={styles.currentPrice}>UGX {sellingPrice.toLocaleString()}</Text>
              <Text style={styles.pricePerUnit}>per {unitAbr || unitName.toLowerCase()}</Text>
            </View>

            {/* Category & Unit */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Package size={14} color="#6b7280" />
                <Text style={styles.metaText}>{categoryName}</Text>
              </View>
              <View style={styles.metaItem}>
                <Box size={14} color="#6b7280" />
                <Text style={styles.metaText}>{unitName}</Text>
              </View>
            </View>

            {/* Barcode */}
            {item.barcode ? (
              <View style={styles.barcodeRow}>
                <Hash size={14} color="#6b7280" />
                <Text style={styles.barcodeText}>Barcode: {item.barcode}</Text>
              </View>
            ) : null}

            {/* Variations (strength / dosage) */}
            {variations.length > 0 && (
              <View style={styles.variationContainer}>
                <Text style={styles.sectionLabel}>Variations:</Text>
                <View style={styles.variationOptions}>
                  {variations.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.variationChip,
                        selectedVariation === v.id && styles.variationChipSelected,
                      ]}
                      onPress={() =>
                        setSelectedVariation(selectedVariation === v.id ? null : v.id)
                      }
                    >
                      <Text
                        style={[
                          styles.variationChipText,
                          selectedVariation === v.id && styles.variationChipTextSelected,
                        ]}
                      >
                        {v.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Quantity */}
            <View style={styles.quantityContainer}>
              <Text style={styles.sectionLabel}>Quantity:</Text>
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

            {/* Stock info */}
            <View style={styles.stockRow}>
              <CheckCircle size={16} color="#1da250" />
              <Text style={styles.inStockText}>In Stock</Text>
              {item.alertStockLevel && (
                <Text style={styles.alertStockText}>
                  (Min. alert: {item.alertStockLevel})
                </Text>
              )}
            </View>

            {/* Add to Cart */}
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                variations.length > 0 && !selectedVariation && styles.addToCartButtonDisabled,
              ]}
              onPress={handleAddToCart}
              activeOpacity={variations.length > 0 && !selectedVariation ? 1 : 0.7}
            >
              <ShoppingCart size={20} color="#ffffff" />
              <Text style={styles.addToCartText}>
                {variations.length > 0 && !selectedVariation
                  ? 'Select a variation first'
                  : variations.length > 0 && selectedVariation
                  ? `Add ${variations.find(v => v.id === selectedVariation)?.value}`
                  : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            {/* Product Information */}
            <InfoSection icon={<Package size={20} color="#1da250" />} title="Product Information">
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{categoryName}</Text>
              </View>
              {brandName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Brand</Text>
                  <Text style={styles.detailValue}>{brandName}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Unit</Text>
                <Text style={styles.detailValue}>{unitName} ({unitAbr})</Text>
              </View>
              {item.barcode && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Barcode</Text>
                  <Text style={styles.detailValue}>{item.barcode}</Text>
                </View>
              )}
              {item.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Added</Text>
                  <Text style={styles.detailValue}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </InfoSection>

            {/* Description */}
            <InfoSection icon={<Pill size={20} color="#1da250" />} title="Description">
              <Text style={styles.descriptionText}>{description}</Text>
            </InfoSection>

            {/* Side Effects */}
            {sideEffects.length > 0 && (
              <InfoSection icon={<AlertTriangle size={20} color="#f59e0b" />} title="Side Effects">
                {sideEffects.map((se) => (
                  <View key={se.id} style={styles.sideEffectItem}>
                    <View style={styles.sideEffectHeader}>
                      <Text style={styles.sideEffectName}>{se.name}</Text>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: severityColor(se.severity) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.severityText,
                            { color: severityColor(se.severity) },
                          ]}
                        >
                          {se.severity}
                        </Text>
                      </View>
                    </View>
                    {se.description ? (
                      <Text style={styles.sideEffectDesc}>{se.description}</Text>
                    ) : null}
                  </View>
                ))}
              </InfoSection>
            )}

            {/* Variations Detail */}
            {variations.length > 0 && (
              <InfoSection icon={<FlaskConical size={20} color="#1da250" />} title="Available Strengths / Variations">
                <BulletList
                  items={variations.map((v) => ({
                    label: v.name,
                    text: v.value,
                  }))}
                  color="#1da250"
                />
              </InfoSection>
            )}
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
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#1da250',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    fontSize: 64,
  },
  wishlistButton: {
    position: 'absolute',
    top: 24,
    right: 24,
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
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  brandText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceSection: {
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1da250',
  },
  pricePerUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  variationContainer: {
    marginBottom: 16,
  },
  variationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  variationChipSelected: {
    backgroundColor: '#1da250',
    borderColor: '#1da250',
  },
  variationChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  variationChipTextSelected: {
    color: '#ffffff',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  inStockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1da250',
  },
  alertStockText: {
    fontSize: 12,
    color: '#9ca3af',
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
    shadowColor: '#9ca3af',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
    paddingBottom: 40,
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
    marginTop: 6,
    marginRight: 8,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sideEffectItem: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  sideEffectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sideEffectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sideEffectDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  posSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  posRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  posText: {
    fontSize: 14,
    color: '#1da250',
    fontWeight: '500',
  },
  posTextDisabled: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
});
