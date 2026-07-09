import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { useRouter } from 'expo-router';
import { Truck } from 'lucide-react-native';
import React from 'react';

export default function OnboardingScreen2() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={2}
      icon={Truck}
      title="Delivered when you need it"
      description="Order prescriptions and essentials with fast, reliable delivery — tracked every step of the way until they reach your door."
      highlights={[
        { text: 'Same-day delivery in supported areas' },
        { text: 'Live order tracking & notifications' },
        { text: 'Handled by trusted pharmacy partners' },
      ]}
      showBack
      onBack={() => router.back()}
      onPrimaryPress={() => router.push('/onboarding/onboarding-3')}
    />
  );
}
