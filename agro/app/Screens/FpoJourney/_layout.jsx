import React from 'react';
import { Stack } from 'expo-router';

export default function FpoJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="Signup" />
      <Stack.Screen name="Profile" />
      <Stack.Screen name="ContactUs" />
      <Stack.Screen name="Test" />
      <Stack.Screen name="Test2" />
      <Stack.Screen name="AddFarmerForm" />
    </Stack>
  );
} 