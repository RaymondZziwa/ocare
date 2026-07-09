import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasCompletedOnboarding } from '@/constants/onboarding';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const logo = require('../assets/images/logo.jpg');
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const MIN_SPLASH_MS = 1800;

type SplashPhase = 'checking' | 'loading' | 'offline' | 'error';

const STATUS_COPY: Record<SplashPhase, string> = {
  checking: 'Checking connection',
  loading: 'Preparing your experience',
  offline: 'No internet connection',
  error: 'Something went wrong',
};

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<SplashPhase>('checking');
  const [retryKey, setRetryKey] = useState(0);

  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const blobDrift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blobDrift, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(blobDrift, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    entrance.start();
    pulseLoop.start();
    driftLoop.start();

    return () => {
      entrance.stop();
      pulseLoop.stop();
      driftLoop.stop();
    };
  }, [blobDrift, contentOpacity, contentTranslateY, logoOpacity, logoScale, pulse]);

  useEffect(() => {
    let cancelled = false;
    let navigationTimer: ReturnType<typeof setTimeout> | undefined;

    const navigateNext = async () => {
      try {
        const completed = await hasCompletedOnboarding();
        const authToken = await AsyncStorage.getItem('authToken');

        if (cancelled) return;

        if (!completed) {
          router.replace('/onboarding/onboarding-1' as any);
        } else if (!authToken) {
          router.replace('/auth/sign-in' as any);
        } else {
          router.replace('/(tabs)' as any);
        }
      } catch {
        if (!cancelled) {
          router.replace('/onboarding/onboarding-1' as any);
        }
      }
    };

    const bootstrap = async () => {
      const startedAt = Date.now();

      try {
        setPhase('checking');
        const netInfo = await NetInfo.fetch();

        if (netInfo.isInternetReachable === null) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (cancelled) return;

          const retryInfo = await NetInfo.fetch();
          if (!retryInfo.isConnected || retryInfo.isInternetReachable !== true) {
            setPhase('offline');
            return;
          }
        } else if (!netInfo.isConnected || netInfo.isInternetReachable !== true) {
          setPhase('offline');
          return;
        }

        if (cancelled) return;

        setPhase('loading');

        Animated.timing(progress, {
          toValue: 1,
          duration: MIN_SPLASH_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();

        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(MIN_SPLASH_MS - elapsed, 400);

        navigationTimer = setTimeout(() => {
          navigateNext();
        }, remaining);
      } catch {
        if (!cancelled) {
          setPhase('error');
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
      if (navigationTimer) clearTimeout(navigationTimer);
    };
  }, [progress, retryKey, router]);

  const dotOpacity = (index: number) =>
    pulse.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange:
        index === 0
          ? [0.35, 1, 0.35]
          : index === 1
            ? [0.65, 0.35, 1]
            : [1, 0.65, 0.35],
    });

  const blobShift = blobDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  const showLoader = phase === 'checking' || phase === 'loading';
  const showRetry = phase === 'offline' || phase === 'error';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ecfdf3" translucent />

      <Animated.View
        pointerEvents="none"
        style={[styles.blobPrimary, { transform: [{ translateY: blobShift }] }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobSecondary,
          {
            transform: [
              {
                translateY: blobDrift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -14],
                }),
              },
            ],
          },
        ]}
      />
      <View pointerEvents="none" style={styles.blobAccent} />

      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <Animated.View
          style={[
            styles.logoShell,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoGlow} />
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.brandName}>OCare</Text>
          <Text style={styles.tagline}>Pharmacy & wellness, simplified</Text>

          <View style={styles.loaderCard}>
            <View style={styles.statusRow}>
              {phase === 'offline' || phase === 'error' ? (
                <AlertTriangle size={16} color="#dc2626" />
              ) : (
                <Wifi size={16} color="#1da250" />
              )}
              <Text
                style={[
                  styles.statusText,
                  (phase === 'offline' || phase === 'error') && styles.statusTextError,
                ]}
              >
                {STATUS_COPY[phase]}
              </Text>
            </View>

            {showLoader && (
              <>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['8%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>

                <View style={styles.dotsRow}>
                  {[0, 1, 2].map((index) => (
                    <Animated.View
                      key={index}
                      style={[styles.dot, { opacity: dotOpacity(index) }]}
                    />
                  ))}
                </View>
              </>
            )}

            {showRetry && (
              <>
                <Text style={styles.helperText}>
                  Connect to the internet and try again to continue.
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.retryButtonPressed,
                  ]}
                  onPress={() => {
                    progress.setValue(0);
                    setPhase('checking');
                    setRetryKey((value) => value + 1);
                  }}
                >
                  <RefreshCw size={16} color="#ffffff" />
                  <Text style={styles.retryButtonText}>Try again</Text>
                </Pressable>
              </>
            )}
          </View>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.footerLabel}>Version {APP_VERSION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf3',
  },
  blobPrimary: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(29, 162, 80, 0.14)',
  },
  blobSecondary: {
    position: 'absolute',
    bottom: 120,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(14, 116, 84, 0.1)',
  },
  blobAccent: {
    position: 'absolute',
    top: '42%',
    right: 24,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoShell: {
    width: 132,
    height: 132,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#1da250',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  logoGlow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: 'rgba(29, 162, 80, 0.08)',
  },
  logo: {
    width: 92,
    height: 92,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#14532d',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 22,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 34,
  },
  loaderCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  statusTextError: {
    color: '#dc2626',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1da250',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1da250',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1da250',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  retryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
