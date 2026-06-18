import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ChevronRight } from 'lucide-react-native';

const healthImage = require("../../assets/images/logo.jpg");

export default function OnboardingScreen1() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/onboarding-2');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Heart size={80} color="#1da250" />
      </View>
      
      <Text style={styles.title}>Manage Your Health</Text>
      
      <Text style={styles.description}>
        Take control of your wellness journey with our comprehensive health management tools. 
        Track medications, set reminders, and monitor your health progress all in one place. 
        Your health data is secure and easily accessible whenever you need it.
      </Text>
  

      <View style={styles.navigationContainer}>
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
    marginBottom: 40,
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
    right: 30,
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
