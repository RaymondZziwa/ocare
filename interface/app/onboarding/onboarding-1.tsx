import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';

export default function OnboardingScreen1() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={1}
      icon={Heart}
      title="Your health, organized"
      description="Track medications, manage prescriptions, and stay on top of your wellness — all from one beautiful, easy-to-use app."
      highlights={[
        { text: 'Smart medication reminders' },
        { text: 'Secure health records in one place' },
        { text: 'Progress you can actually see' },
      ]}
      onPrimaryPress={() => router.push('/onboarding/onboarding-2')}
    />
  );
}
