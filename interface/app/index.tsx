import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, StatusBar, Animated, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AlertTriangle } from 'lucide-react-native'
import { toast } from 'sonner-native'

const logo = require("../assets/images/logo.jpg");

export default function Index() {
  const router = useRouter();
  const [progress] = useState(new Animated.Value(0));
  const [statusText, setStatusText] = useState('Checking connectivity...');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check internet connectivity
    const checkConnectivity = async () => {
      try {
        setStatusText('Checking connectivity...');
        const netInfo = await NetInfo.fetch();
        
        console.log("NetInfo result:", netInfo);
        
        // Handle the case where isInternetReachable is still null
        if (netInfo.isInternetReachable === null) {
          // Wait a bit and check again
          setTimeout(() => {
            checkConnectivity();
          }, 1000);
          return;
        }
        
        if (netInfo.isConnected && netInfo.isInternetReachable === true) {
          console.log("Connected to internet", netInfo);
          // Connected - check onboarding status
          setStatusText('Launching...');
          setHasError(false);
          
          // Define the navigation function first
          const checkOnboardingAndNavigate = async () => {
            try {
              const hasCompletedOnboarding = await AsyncStorage.getItem('@onboarding_completed') ?? false;
              
              console.log("Onboarding status:", hasCompletedOnboarding);
              if (hasCompletedOnboarding === 'true') {
                // User has completed onboarding, go to dashboard
                router.replace('/(tabs)/index' as any);
              } else {
                // First time user, show onboarding
                router.replace('/onboarding/onboarding-1' as any);
              }
            } catch (error) {
              console.error('Error checking onboarding status:', error);
              // Fallback to onboarding if there's an error
              router.replace('/onboarding/onboarding-1' as any);
            }
          };

          // Start progress animation
          Animated.timing(progress, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
          }).start();

          // Check onboarding status and navigate after 5 seconds
          const timer = setTimeout(() => {
            checkOnboardingAndNavigate();
          }, 5000);

          return () => clearTimeout(timer);
        } else {
          console.log("No internet connection", netInfo);
          // No internet connection
          setStatusText('No internet connection');
          setHasError(true);
          
          // Show alert
          toast.error(
            'Please check your internet connection and try again. The app requires an active internet connection.',
          );
        }
      } catch (error) {
        console.log("Connection check error:", error);
        setStatusText('Connection check failed');
        setHasError(true);
      }
    };
    checkConnectivity();
  }, [progress, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.text}>Pharmacy & Wellness</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.statusRow}>
            {hasError && (
              <AlertTriangle 
                size={16} 
                color="#dc2626" 
                style={styles.errorIcon}
              />
            )}
            <Text style={[styles.progressText, hasError && styles.errorText]}>
              {statusText}
            </Text>
          </View>
          {!hasError && (
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]}
              />
            </View>
          )}
        </View>
      </View>
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
  },
  text: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 10
  },
  versionText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 1,
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 50,
    width: '80%',
    alignItems: 'center',
  },
  progressText: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1da250',
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    color: '#dc2626',
  },
})
