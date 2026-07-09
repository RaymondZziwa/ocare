import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { markOnboardingComplete } from '@/constants/onboarding';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OnboardingScreen4() {
  const router = useRouter();

  const handleGetStarted = async () => {
    await markOnboardingComplete();
    router.replace('/auth/sign-in' as any);
  };

  return (
    <OnboardingLayout
      step={4}
      icon={Sparkles}
      title="You're all set"
      description="Join thousands of people who manage their pharmacy needs smarter — with care, speed, and peace of mind."
      showBack
      onBack={() => router.back()}
      showSkip={false}
      primaryLabel="Get started"
      onPrimaryPress={handleGetStarted}
      footer={
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>50K+</Text>
              <Text style={styles.statLabel}>Happy customers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>99%</Text>
              <Text style={styles.statLabel}>Satisfaction</Text>
            </View>
          </View>

          <Text style={styles.legalText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1da250',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  legalText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
});
