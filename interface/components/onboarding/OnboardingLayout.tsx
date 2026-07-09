import { hasCompletedOnboarding, markOnboardingComplete } from '@/constants/onboarding';
import { useRouter } from 'expo-router';
import { ChevronLeft, LucideIcon } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Highlight = {
  text: string;
  emoji?: string;
};

type OnboardingLayoutProps = {
  step: number;
  totalSteps?: number;
  icon: LucideIcon;
  title: string;
  description: string;
  highlights?: Highlight[];
  primaryLabel?: string;
  onPrimaryPress: () => void | Promise<void>;
  showBack?: boolean;
  onBack?: () => void;
  showSkip?: boolean;
  footer?: React.ReactNode;
};

export default function OnboardingLayout({
  step,
  totalSteps = 4,
  icon: Icon,
  title,
  description,
  highlights,
  primaryLabel = 'Continue',
  onPrimaryPress,
  showBack = false,
  onBack,
  showSkip = true,
  footer,
}: OnboardingLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    let active = true;

    hasCompletedOnboarding().then((completed) => {
      if (completed && active) {
        router.replace('/(tabs)/index' as any);
      }
    });

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      active = false;
    };
  }, [fade, router, slide]);

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.replace('/auth/sign-in' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ecfdf3" translucent />
      <View pointerEvents="none" style={styles.blobPrimary} />
      <View pointerEvents="none" style={styles.blobSecondary} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {showBack ? (
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            onPress={onBack}
            hitSlop={12}
          >
            <ChevronLeft size={22} color="#334155" />
          </Pressable>
        ) : (
          <View style={styles.iconButtonPlaceholder} />
        )}

        <View style={styles.dotsRow}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index + 1 === step;
            return (
              <View
                key={index}
                style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
              />
            );
          })}
        </View>

        {showSkip ? (
          <Pressable
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
            onPress={handleSkip}
            hitSlop={8}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.iconButtonPlaceholder} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <View style={styles.iconRing}>
              <Icon size={54} color="#1da250" strokeWidth={1.8} />
            </View>
            <Text style={styles.stepLabel}>
              Step {step} of {totalSteps}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {highlights && highlights.length > 0 && (
            <View style={styles.highlights}>
              {highlights.map((item) => (
                <View key={item.text} style={styles.highlightCard}>
                  {item.emoji ? (
                    <Text style={styles.highlightEmoji}>{item.emoji}</Text>
                  ) : (
                    <View style={styles.highlightBullet} />
                  )}
                  <Text style={styles.highlightText}>{item.text}</Text>
                </View>
              ))}
            </View>
          )}

          {footer}

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onPrimaryPress}
          >
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
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
    top: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 162, 80, 0.12)',
  },
  blobSecondary: {
    position: 'absolute',
    bottom: 80,
    left: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(14, 116, 84, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#1da250',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#bbf7d0',
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  pressed: {
    opacity: 0.85,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  heroCard: {
    alignSelf: 'center',
    width: 168,
    height: 168,
    borderRadius: 42,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#1da250',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  heroGlow: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 36,
    backgroundColor: 'rgba(29, 162, 80, 0.08)',
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14532d',
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  highlights: {
    gap: 10,
    marginBottom: 24,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  highlightEmoji: {
    fontSize: 18,
  },
  highlightBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1da250',
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#1da250',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1da250',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
    marginTop: 8,
  },
  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
