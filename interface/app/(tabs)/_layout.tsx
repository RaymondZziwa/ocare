import { store } from '@/redux/store';
import { Stack } from 'expo-router';
import React from 'react';
import { Provider } from 'react-redux';

export default function TabLayout() {
  return (
    <Provider store={store}>
<Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="refill" />
      <Stack.Screen name="profile" />
    </Stack>
    </Provider>
  );
}
