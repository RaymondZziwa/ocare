import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Pill, Calendar, Clock, ChevronLeft, Filter, Search } from 'lucide-react-native';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const prescriptions = [
    {
      id: '1',
      medication: 'Amoxicillin 500mg',
      doctor: 'Dr. Sarah Johnson',
      prescribedDate: '2024-01-15',
      status: 'active',
      refills: 3,
      refillsUsed: 1,
      nextRefill: '2024-02-15',
      dosage: '1 tablet, 3 times daily',
      duration: '10 days',
    },
    {
      id: '2',
      medication: 'Lisinopril 10mg',
      doctor: 'Dr. Michael Chen',
      prescribedDate: '2024-01-10',
      status: 'completed',
      refills: 2,
      refillsUsed: 2,
      nextRefill: 'No refills remaining',
      dosage: '1 tablet daily',
      duration: '30 days',
    },
    {
      id: '3',
      medication: 'Metformin 500mg',
      doctor: 'Dr. Emily Davis',
      prescribedDate: '2024-02-01',
      status: 'active',
      refills: 6,
      refillsUsed: 0,
      nextRefill: '2024-03-01',
      dosage: '2 tablets daily',
      duration: '90 days',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleRefill = (prescriptionId: string) => {
    Alert.alert(
      'Request Refill',
      'Are you sure you want to request a refill for this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', onPress: () => console.log('Refill requested:', prescriptionId) }
      ]
    );
  };

  const handleViewDetails = (prescriptionId: string) => {
    Alert.alert('Prescription Details', `Viewing details for prescription ${prescriptionId}`);
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (selectedFilter === 'active') return prescription.status === 'active';
    if (selectedFilter === 'completed') return prescription.status === 'completed';
    return true; // 'all'
  });

  const searchedPrescriptions = filteredPrescriptions.filter(prescription =>
    prescription.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#1da250' : '#6b7280';
  };

  const getRefillProgress = (used: number, total: number) => {
    return (used / total) * 100;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Past Prescriptions</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View style={styles.filterContainer}>
          {['all', 'active', 'completed'].map((filter) => (
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

      <ScrollView style={styles.prescriptionsList}>
        {searchedPrescriptions.map((prescription) => (
          <View key={prescription.id} style={styles.prescriptionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.medicationInfo}>
                <View style={styles.medicationRow}>
                  <Pill size={20} color="#1da250" />
                  <Text style={styles.medicationName}>{prescription.medication}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) }]}>
                  <Text style={styles.statusText}>{prescription.status}</Text>
                </View>
              </View>
              
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{prescription.doctor}</Text>
                <View style={styles.dateInfo}>
                  <Calendar size={14} color="#6b7280" />
                  <Text style={styles.prescribedDate}>Prescribed: {prescription.prescribedDate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.dosageInfo}>
                <Text style={styles.dosageLabel}>Dosage</Text>
                <Text style={styles.dosageValue}>{prescription.dosage}</Text>
              </View>
              
              <View style={styles.dosageInfo}>
                <Text style={styles.dosageLabel}>Duration</Text>
                <Text style={styles.dosageValue}>{prescription.duration}</Text>
              </View>
            </View>

            <View style={styles.refillSection}>
              <View style={styles.refillHeader}>
                <Text style={styles.refillTitle}>Refills</Text>
                <Text style={styles.refillCount}>
                  {prescription.refillsUsed}/{prescription.refills}
                </Text>
              </View>
              
              <View style={styles.refillProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${getRefillProgress(prescription.refillsUsed, prescription.refills)}%` }
                    ]} 
                  />
                </View>
              </View>
              
              <Text style={styles.nextRefill}>Next refill: {prescription.nextRefill}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewDetails(prescription.id)}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
              
              {prescription.status === 'active' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.refillButton]}
                  onPress={() => handleRefill(prescription.id)}
                >
                  <Text style={styles.actionButtonText}>Request Refill</Text>
                </TouchableOpacity>
              )}
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
  prescriptionsList: {
    flex: 1,
    padding: 16,
  },
  prescriptionCard: {
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
  medicationInfo: {
    marginBottom: 12,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorName: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prescribedDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  cardBody: {
    padding: 16,
  },
  dosageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dosageLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dosageValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '400',
  },
  refillSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  refillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refillTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  refillCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1da250',
  },
  refillProgress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1da250',
    borderRadius: 2,
  },
  nextRefill: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
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
  refillButton: {
    backgroundColor: '#1da250',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1da250',
  },
});
