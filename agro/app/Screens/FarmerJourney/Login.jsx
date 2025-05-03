import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../services/config';

const LoginPage = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      console.log(`Sending OTP to phone: ${phoneNumber}`);
      console.log(`API URL: ${API_BASE_URL}/api/auth/farmer/send-otp`);
      
      const requestBody = { phone: phoneNumber };
      console.log('Request payload:', JSON.stringify(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/api/auth/farmer/send-otp`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error(`Server responded with ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      if (data.success) {
        Alert.alert('Success', 'OTP sent successfully to your mobile number');
        setIsOtpSent(true);
        
        // In development, auto-fill OTP if available
        if (data.otp) {
          console.log('Auto-filling OTP for development:', data.otp);
          setOtp(data.otp);
        }
      } else {
        console.error('Failed to send OTP:', data.message);
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error.message);
      Alert.alert('Error', 'An error occurred while sending OTP. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log(`Verifying OTP for phone: ${phoneNumber}, OTP: ${otp}`);
      console.log(`API URL: ${API_BASE_URL}/api/auth/farmer/verify-otp`);
      
      const requestBody = { phone: phoneNumber, otp };
      console.log('Request payload:', JSON.stringify(requestBody));
      
      // Using fetch with explicit mode
      const response = await fetch(`${API_BASE_URL}/api/auth/farmer/verify-otp`, {
        method: 'POST',
        mode: 'cors', // Explicitly set CORS mode
        cache: 'no-cache', // Don't cache response
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error(`Server responded with ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      console.log('OTP verification response:', data);
      
      if (data.success) {
        console.log(`Authentication successful for farmer ID: ${data.farmerId}`);
        console.log(`Received token: ${data.accessToken ? data.accessToken.substring(0, 15) + '...' : 'none'}`);
        
        // Save authentication data to AsyncStorage
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        await AsyncStorage.setItem('farmerId', String(data.farmerId));
        await AsyncStorage.setItem('farmerName', data.farmerName || '');
        
        // Navigate to farmer profile directly
        console.log(`Navigating to profile page for farmer ID: ${data.farmerId}`);
        router.push(`/Screens/FarmerJourney/FarmerProfile?id=${data.farmerId}`);
      } else {
        console.error('Authentication failed:', data.message);
        Alert.alert('Error', data.message || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error.message);
      Alert.alert('Error', 'An error occurred while verifying OTP. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmer Login</Text>
      <Text style={styles.subtitle}>Enter your registered phone number to continue</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        maxLength={10}
        editable={!isOtpSent}
      />
      
      {isOtpSent && (
        <>
          <Text style={styles.otpText}>Enter the 6-digit OTP sent to {phoneNumber}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resendButton} 
            onPress={handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.resendButtonText}>Resend OTP</Text>
          </TouchableOpacity>
        </>
      )}
      
      {!isOtpSent && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  otpText: {
    marginBottom: 12,
    fontSize: 14,
    color: '#555',
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  resendButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  }
});

export default LoginPage;