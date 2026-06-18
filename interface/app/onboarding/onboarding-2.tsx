import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Truck, ChevronLeft, ChevronRight } from 'lucide-react-native';

const deliveryImage = require("../../assets/images/logo.jpg");

export default function OnboardingScreen2() {
  const router = useRouter();

  const handlePrevious = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/onboarding/onboarding-3');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Truck size={80} color="#1da250" />
      </View>
      
      <Text style={styles.title}>Fast Delivery</Text>
      
      <Text style={styles.description}>
        Get your medications delivered right to your doorstep in record time. 
        Our efficient delivery network ensures your prescriptions arrive quickly and safely. 
        Track your order in real-time and receive notifications when your delivery is on the way.
      </Text>
      
      <View style={styles.features}>
        <View style={styles.feature}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Same-day delivery available</Text>
        </View>
        <View style={styles.feature}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Real-time order tracking</Text>
        </View>
        <View style={styles.feature}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Professional delivery service</Text>
        </View>
      </View>
      

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handlePrevious}
        >
          <ChevronLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
        >
          <ChevronRight size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 50,
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  features: {
    width: '100%',
    marginBottom: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1da250',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 40,
    gap: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1da250',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1da250',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
