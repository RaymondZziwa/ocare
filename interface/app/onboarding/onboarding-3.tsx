import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import React from 'react';

export default function OnboardingScreen3() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={3}
      icon={Shield}
      title="Safe, verified, private"
      description="Your data is protected with industry-grade security, and every order is reviewed by licensed pharmacists you can trust."
      highlights={[
        { emoji: '🔒', text: 'End-to-end encrypted data' },
        { emoji: '⚕️', text: 'Verified by licensed pharmacists' },
        { emoji: '🛡️', text: 'Privacy-first by design' },
      ]}
      showBack
      onBack={() => router.back()}
      onPrimaryPress={() => router.push('/onboarding/onboarding-4')}
    />
  );
}
