import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const securityImage = require("../../assets/images/logo.jpg");

export default function OnboardingScreen3() {
  const router = useRouter();
  const handlePrevious = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/onboarding/onboarding-4');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Shield size={80} color="#1da250" />
      </View>
      
      <Text style={styles.title}>Safe & Secure</Text>
      
      <Text style={styles.description}>
        Your health data and privacy are our top priorities. We use industry-leading encryption 
        and security measures to protect your personal information. All medications are verified 
        by licensed pharmacists to ensure your safety and well-being.
      </Text>
      
      <View style={styles.securityBadges}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔒 End-to-end encryption</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚕️ Licensed pharmacists</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🛡️ HIPAA compliant</Text>
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
  securityBadges: {
    width: '100%',
    marginBottom: 30,
  },
  badge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1da250',
  },
  badgeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
