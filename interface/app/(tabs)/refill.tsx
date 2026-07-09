// Prescription refill screen - commented out for now
// import React, { useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
// import { useRouter } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { 
//   Pill, 
//   Calendar, 
//   Clock, 
//   Plus, 
//   Search, 
//   ChevronRight, 
//   Camera,
// ) AlertCircle,
//   CheckCircle
// } from 'lucide-react-native';
// import BottomNavigation from '../../components/BottomNavigation';

// export default function RefillScreen() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');

//   const prescriptions = [
//     {
//       id: '1',
//       medication: 'Amoxicillin 500mg',
//       doctor: 'Dr. Sarah Johnson',
//       prescribedDate: '2024-01-15',
//       refillsUsed: 1,
//       refillsAllowed: 3,
//       nextRefillDate: '2024-02-15',
//       status: 'available',
//       lastRefillDate: '2024-01-15',
//       pharmacy: 'OCare Pharmacy',
//       instructions: 'Take 1 tablet 3 times daily with food',
//     },
//     {
//       id: '2',
//       medication: 'Lisinopril 10mg',
//       doctor: 'Dr. Michael Brown',
//       prescribedDate: '2024-01-10',
//       refillsUsed: 2,
//       refillsAllowed: 5,
//       nextRefillDate: '2024-02-10',
//       status: 'available',
//       lastRefillDate: '2024-01-10',
//       pharmacy: 'OCare Pharmacy',
//       instructions: 'Take 1 tablet daily in the morning',
//     },
//     {
//       id: '3',
//       medication: 'Metformin 500mg',
//       doctor: 'Dr. Emily Davis',
//       prescribedDate: '2024-01-05',
//       refillsUsed: 3,
//       refillsAllowed: 3,
//       nextRefillDate: '2024-02-05',
//       status: 'expired',
//       lastRefillDate: '2024-01-05',
//       pharmacy: 'OCare Pharmacy',
//       instructions: 'Take 1 tablet twice daily with meals',
//     },
//     {
//       id: '4',
//       medication: 'Vitamin D3 1000IU',
//       doctor: 'Dr. Sarah Johnson',
//       prescribedDate: '2024-01-20',
//       refillsUsed: 0,
//       refillsAllowed: 12,
//       nextRefillDate: '2024-02-20',
//       status: 'available',
//       lastRefillDate: null,
//       pharmacy: 'OCare Pharmacy',
//       instructions: 'Take 1 tablet daily with breakfast',
//     },
//   ];

//   const handleRefillRequest = (prescriptionId: string) => {
//     Alert.alert(
//       'Refill Request',
//       'Request refill for this prescription?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Request', onPress: () => {
//           Alert.alert('Success', 'Refill request submitted successfully!');
//         }}
//       ]
//     );
//   };

//   const handleUploadPrescription = () => {
//     Alert.alert(
//       'Upload Prescription',
//       'Choose how to add your prescription',
//       [
//         { text: 'Camera', onPress: () => Alert.alert('Camera', 'Opening camera...') },
//         { text: 'Gallery', onPress: () => Alert.alert('Gallery', 'Opening gallery...') },
//         { text: 'Cancel', style: 'cancel' }
//       ]
//     );
//   };

//   const filteredPrescriptions = prescriptions.filter(prescription => {
//     const matchesSearch = prescription.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          prescription.doctor.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesFilter = selectedFilter === 'all' || prescription.status === selectedFilter;
//     return matchesSearch && matchesFilter;
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'available': return '#1da250';
//       case 'expired': return '#dc2626';
//       case 'pending': return '#f59e0b';
//       default: return '#6b7280';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'available': return <CheckCircle size={16} color="#ffffff" />;
//       case 'expired': return <AlertCircle size={16} color="#ffffff" />;
//       case 'pending': return <Clock size={16} color="#ffffff" />;
//       default: return null;
//     }
//   };

//   const PrescriptionCard = ({ prescription }: { prescription: any }) => (
//     <View style={styles.prescriptionCard}>
//       <View style={styles.cardHeader}>
//         <View style={styles.medicationInfo}>
//           <View style={styles.medicationRow}>
//             <Pill size={20} color="#1da250" />
//             <View>
//               <Text style={styles.medicationName}>{prescription.medication}</Text>
//               <Text style={styles.doctorName}>{prescription.doctor}</Text>
//             </View>
//           </View>
//           <View style={[
//             styles.statusBadge,
//             { backgroundColor: getStatusColor(prescription.status) }
//           ]}>
//             {getStatusIcon(prescription.status)}
//             <Text style={styles.statusText}>{prescription.status}</Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.cardBody}>
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Prescribed:</Text>
//           <Text style={styles.infoValue}>{prescription.prescribedDate}</Text>
//         </View>
        
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Pharmacy:</Text>
//           <Text style={styles.infoValue}>{prescription.pharmacy}</Text>
//         </View>
        
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Refills:</Text>
//           <Text style={styles.infoValue}>
//             {prescription.refillsUsed} of {prescription.refillsAllowed}
//           </Text>
//         </View>

//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Next Refill:</Text>
//           <Text style={styles.infoValue}>{prescription.nextRefillDate}</Text>
//         </View>

//         <View style={styles.instructionsContainer}>
//           <Text style={styles.instructionsLabel}>Instructions:</Text>
//           <Text style={styles.instructionsText}>{prescription.instructions}</Text>
//         </View>
//       </View>

//       <View style={styles.cardActions}>
//         <TouchableOpacity
//           style={[
//             styles.refillButton,
//             prescription.status !== 'available' && styles.refillButtonDisabled
//           ]}
//           onPress={() => handleRefillRequest(prescription.id)}
//           disabled={prescription.status !== 'available'}
//         >
//           <Text style={[
//             styles.refillButtonText,
//             prescription.status !== 'available' && styles.refillButtonTextDisabled
//           ]}>
//             {prescription.status === 'available' ? 'Request Refill' : 
//              prescription.status === 'expired' ? 'Expired' : 'Pending'}
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity style={styles.detailsButton}>
//           <Text style={styles.detailsButtonText}>View Details</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Prescription Refill</Text>
//         </View>

//         <View style={styles.searchSection}>
//           <View style={styles.searchContainer}>
//             <Search size={20} color="#6b7280" style={styles.searchIcon} />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search prescriptions..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               placeholderTextColor="#9ca3af"
//             />
//           </View>
          
//           <View style={styles.filterContainer}>
//             {['all', 'available', 'expired', 'pending'].map((filter) => (
//               <TouchableOpacity
//                 key={filter}
//                 style={[
//                   styles.filterButton,
//                   selectedFilter === filter && styles.filterButtonActive
//                 ]}
//                 onPress={() => setSelectedFilter(filter)}
//               >
//                 <Text style={[
//                   styles.filterText,
//                   selectedFilter === filter && styles.filterTextActive
//                 ]}>
//                   {filter.charAt(0).toUpperCase() + filter.slice(1)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//           <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPrescription}>
//             <View style={styles.uploadContent}>
//               <View style={styles.uploadIcon}>
//                 <Camera size={24} color="#1da250" />
//               </View>
//               <View style={styles.uploadText}>
//                 <Text style={styles.uploadTitle}>Upload New Prescription</Text>
//                 <Text style={styles.uploadSubtitle}>Take a photo or choose from gallery</Text>
//               </View>
//               <ChevronRight size={20} color="#6b7280" />
//             </View>
//           </TouchableOpacity>

//           <View style={styles.prescriptionsSection}>
//             <Text style={styles.sectionTitle}>Your Prescriptions</Text>
            
//             {filteredPrescriptions.map((prescription) => (
//               <PrescriptionCard key={prescription.id} prescription={prescription} />
//             ))}
//           </View>

//           <View style={styles.quickActionsSection}>
//             <Text style={styles.sectionTitle}>Quick Actions</Text>
            
//             <View style={styles.quickActionsGrid}>
//               <TouchableOpacity style={styles.quickActionButton}>
//                 <Calendar size={24} color="#1da250" />
//                 <Text style={styles.quickActionText}>Schedule Pickup</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.quickActionButton}>
//                 <Clock size={24} color="#1da250" />
//                 <Text style={styles.quickActionText}>Refill History</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.quickActionButton}>
//                 <AlertCircle size={24} color="#1da250" />
//                 <Text style={styles.quickActionText}>Ask Pharmacist</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.quickActionButton}>
//                 <Plus size={24} color="#1da250" />
//                 <Text style={styles.quickActionText}>Add Prescription</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>

//         <BottomNavigation activeTab="refill" />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1f2937',
//   },
//   searchSection: {
//     padding: 16,
//     backgroundColor: '#f8fafc',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   searchIcon: {
//     marginRight: 12,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1f2937',
//     paddingVertical: 12,
//   },
//   filterContainer: {
//     flexDirection: 'row',
//   },
//   filterButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#ffffff',
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     marginRight: 8,
//   },
//   filterButtonActive: {
//     backgroundColor: '#1da250',
//     borderColor: '#1da250',
//   },
//   filterText: {
//     fontSize: 14,
//     color: '#6b7280',
//     fontWeight: '500',
//   },
//   filterTextActive: {
//     color: '#ffffff',
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   uploadButton: {
//     backgroundColor: '#f0fdf4',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#1da250',
//     marginBottom: 24,
//   },
//   uploadContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   uploadIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#ffffff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   uploadText: {
//     flex: 1,
//   },
//   uploadTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1f2937',
//     marginBottom: 4,
//   },
//   uploadSubtitle: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   prescriptionsSection: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1f2937',
//     marginBottom: 16,
//   },
//   prescriptionCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     marginBottom: 16,
//     shadowColor: '#000000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardHeader: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//   },
//   medicationInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   medicationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   medicationName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1f2937',
//     marginBottom: 4,
//   },
//   doctorName: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     alignSelf: 'flex-start',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#ffffff',
//     marginLeft: 6,
//   },
//   cardBody: {
//     padding: 16,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#6b7280',
//     fontWeight: '500',
//   },
//   infoValue: {
//     fontSize: 14,
//     color: '#1f2937',
//     fontWeight: '400',
//   },
//   instructionsContainer: {
//     marginTop: 12,
//   },
//   instructionsLabel: {
//     fontSize: 14,
//     color: '#6b7280',
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   instructionsText: {
//     fontSize: 14,
//     color: '#1f2937',
//     lineHeight: 20,
//   },
//   cardActions: {
//     flexDirection: 'row',
//     padding: 16,
//     paddingTop: 0,
//     gap: 12,
//   },
//   refillButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     backgroundColor: '#1da250',
//   },
//   refillButtonDisabled: {
//     backgroundColor: '#9ca3af',
//   },
//   refillButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   refillButtonTextDisabled: {
//     color: '#ffffff',
//   },
//   detailsButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#1da250',
//   },
//   detailsButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1da250',
//   },
//   quickActionsSection: {
//     marginBottom: 20,
//   },
//   quickActionsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   quickActionButton: {
//     width: '48%',
//     backgroundColor: '#f0fdf4',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#1da250',
//   },
//   quickActionText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#1da250',
//     marginTop: 8,
//     textAlign: 'center',
//   },
// });

// Placeholder component to prevent routing errors
import React from 'react';
import { View, Text } from 'react-native';

export default function RefillScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Prescription Refill - Coming Soon</Text>
    </View>
  );
}
