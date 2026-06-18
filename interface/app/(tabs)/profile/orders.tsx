import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Package, Clock, CheckCircle, XCircle, Filter, Search } from 'lucide-react-native';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 45.99,
      items: [
        { name: 'Amoxicillin 500mg', quantity: 1, price: 12.99 },
        { name: 'Vitamin D3', quantity: 2, price: 15.99 },
        { name: 'Pain Relief', quantity: 1, price: 17.01 },
      ],
      deliveryAddress: '123 Main St, City, State 12345',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-01-17',
      actualDelivery: '2024-01-16',
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-10',
      status: 'processing',
      total: 67.50,
      items: [
        { name: 'Blood Pressure Monitor', quantity: 1, price: 45.00 },
        { name: 'Test Strips', quantity: 2, price: 11.25 },
        { name: 'Alcohol Swabs', quantity: 1, price: 11.25 },
      ],
      deliveryAddress: '456 Oak Ave, City, State 67890',
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2024-01-20',
      actualDelivery: null,
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-05',
      status: 'cancelled',
      total: 23.99,
      items: [
        { name: 'Cold Medicine', quantity: 1, price: 23.99 },
      ],
      deliveryAddress: '789 Pine St, City, State 11111',
      trackingNumber: null,
      estimatedDelivery: null,
      actualDelivery: null,
    },
    {
      id: 'ORD-2023-099',
      date: '2023-12-28',
      status: 'delivered',
      total: 89.99,
      items: [
        { name: 'First Aid Kit', quantity: 1, price: 39.99 },
        { name: 'Thermometer', quantity: 1, price: 25.00 },
        { name: 'Bandages', quantity: 2, price: 12.50 },
        { name: 'Antibiotic Ointment', quantity: 1, price: 12.50 },
      ],
      deliveryAddress: '321 Elm St, City, State 22222',
      trackingNumber: 'TRK55566777',
      estimatedDelivery: '2023-12-30',
      actualDelivery: '2023-12-29',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleTrackOrder = (trackingNumber: string) => {
    if (trackingNumber) {
      Alert.alert('Track Order', `Tracking number: ${trackingNumber}\nThis would open the tracking website.`);
    } else {
      Alert.alert('Tracking', 'No tracking number available for this order.');
    }
  };

  const handleReorder = (orderId: string) => {
    Alert.alert(
      'Reorder Items',
      'Would you like to reorder all items from this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reorder', onPress: () => console.log('Reorder:', orderId) }
      ]
    );
  };

  const handleViewDetails = (orderId: string) => {
    Alert.alert('Order Details', `Viewing details for order ${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'delivered') return order.status === 'delivered';
    if (selectedFilter === 'processing') return order.status === 'processing';
    if (selectedFilter === 'cancelled') return order.status === 'cancelled';
    return true; // 'all'
  });

  const searchedOrders = filteredOrders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#1da250';
      case 'processing': return '#f59e0b';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} color="#ffffff" />;
      case 'processing': return <Clock size={16} color="#ffffff" />;
      case 'cancelled': return <XCircle size={16} color="#ffffff" />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Order History</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View style={styles.filterContainer}>
          {['all', 'delivered', 'processing', 'cancelled'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.ordersList}>
        {searchedOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <View style={styles.orderInfo}>
                <View style={styles.orderRow}>
                  <Package size={20} color="#1da250" />
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  {getStatusIcon(order.status)}
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.sectionTitle}>Items</Text>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.deliverySection}>
              <Text style={styles.sectionTitle}>Delivery Information</Text>
              <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
              
              {order.trackingNumber && (
                <TouchableOpacity
                  style={styles.trackingRow}
                  onPress={() => handleTrackOrder(order.trackingNumber)}
                >
                  <Text style={styles.trackingLabel}>Tracking: {order.trackingNumber}</Text>
                  <ChevronLeft size={16} color="#1da250" style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              )}
              
              <View style={styles.deliveryDates}>
                {order.estimatedDelivery && (
                  <Text style={styles.deliveryDate}>
                    Est. Delivery: {order.estimatedDelivery}
                  </Text>
                )}
                {order.actualDelivery && (
                  <Text style={styles.deliveryDate}>
                    Delivered: {order.actualDelivery}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewDetails(order.id)}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.reorderButton]}
                onPress={() => handleReorder(order.id)}
              >
                <Text style={styles.actionButtonText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 16,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1da250',
    borderColor: '#1da250',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  cardBody: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 2,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  deliverySection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 12,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1da250',
  },
  trackingLabel: {
    fontSize: 14,
    color: '#1da250',
    fontWeight: '500',
  },
  deliveryDates: {
    marginTop: 8,
  },
  deliveryDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1da250',
  },
  reorderButton: {
    backgroundColor: '#1da250',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1da250',
  },
});
