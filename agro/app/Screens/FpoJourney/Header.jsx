import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../_layout'; // Adjust import path as needed

const GreenHeader = ({ title = "Dashboard", showTime = true }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading, isInitialAuthCheckComplete } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours % 12 || 12}:${mins} ${hours >= 12 ? 'PM' : 'AM'}`;
      setCurrentTime(formattedTime);
      setGreeting(
        hours < 12 ? 'Morning' :
        hours < 17 ? 'Afternoon' :
        'Evening'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logout successful, redirecting to home');
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to log out properly');
    }
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="sprout" size={22} color="#fff" style={styles.icon} />
      {showTime && (
        <Text style={styles.time}>{currentTime} | {greeting}</Text>
      )}
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 8,
  },
  time: {
    color: '#c8e6c9',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  logout: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D32F2F', // red color
    borderRadius: 4,
  },
});

export default GreenHeader;
