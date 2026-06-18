import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface OnboardingScreen4Props {
  onGetStarted?: () => void;
}

export default function OnboardingScreen4({ onGetStarted }: OnboardingScreen4Props) {
  const router = useRouter();
  
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
    router.push('/auth/sign-in');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Sparkles size={80} color="#1da250" />
      </View>
      
      <Text style={styles.title}>Ready to Start?</Text>
      
      <Text style={styles.description}>
        Join thousands of satisfied customers who have transformed their healthcare experience. 
        Your journey to better health and convenient pharmacy services begins now. 
        Get personalized care, fast delivery, and comprehensive health management.
      </Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>50K+</Text>
          <Text style={styles.statLabel}>Happy Customers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>24/7</Text>
          <Text style={styles.statLabel}>Support Available</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>99%</Text>
          <Text style={styles.statLabel}>Satisfaction Rate</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.getStartedButton} 
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
      
      <Text style={styles.footerText}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1da250',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  getStartedButton: {
    backgroundColor: '#1da250',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#1da250',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});
