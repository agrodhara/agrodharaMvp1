import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from '../../_layout';
import { useApi } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../languagejsons/i18n'; // Importing the i18n instance

const LoginScreen = () => {
  const router = useRouter();
  const { login, isAuthenticated, isInitialAuthCheckComplete, isLoading: authLoading } = useAuth();
  const api = useApi();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  




  const [language, setLanguage] = useState('en'); // Default to English

  // Load language from AsyncStorage on component mount
  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
        i18n.locale = storedLanguage; // Set the locale for i18n
      } else {
        console.log('No language set, defaulting to English');
      }
    };
    loadLanguage();
  }, []);

  // Update i18n locale when language state changes
  useEffect(() => {
    i18n.locale = language; // Set the current locale
  }, [language]);




  useFocusEffect(
  useCallback(() => {
    // Reset redirecting flag on focus
    setRedirecting(false);

    if (isInitialAuthCheckComplete && !authLoading && isAuthenticated) {
      console.log("Already authenticated, redirecting to profile");
      router.replace("/Screens/FpoJourney/Profile");
    }
  }, [isAuthenticated, authLoading, isInitialAuthCheckComplete])
);





  const handleLogin = async () => {
    if (!validateInput()) return;
    setIsLoading(true);
    
    try {
      const response = await api.post('api/auth/fpo/login', { phone, password });
      await processLoginResponse(response.data);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateInput = () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter both phone number and password");
      return false;
    }
    if (phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const processLoginResponse = async (responseData) => {
    const { accessToken, refreshToken, fpoDetails } = responseData.data || responseData;
    
    if (!accessToken || !refreshToken) {
      throw new Error("Invalid response format, missing tokens");
    }

    const userData = {
      ...fpoDetails,
      phone: fpoDetails?.phone || phone
    };

    await AsyncStorage.setItem('user_phone', phone);
    await login({ accessToken, refreshToken }, userData);
    
    console.log("Login successful, navigating to profile");
    router.replace("/Screens/FpoJourney/Profile");
  };

  const handleLoginError = (error) => {
    console.error("Login error:", error.response?.data || error.message);
    
    const status = error.response?.status;
    if (status === 401) {
      Alert.alert("Invalid Credentials", "The phone number or password you entered is incorrect");
    } else if (status === 404) {
      Alert.alert(
        "Account Not Found", 
        "No account exists with this phone number", 
        [
          { text: "Sign Up", onPress: () => router.push("../Signup") },
          { text: "Try Again", style: "cancel" }
        ]
      );
    } else {
      Alert.alert("Login Failed", "Please try again later");
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B7A0B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (

<ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/images/Logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>{i18n.t("common.welcome")}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>{i18n.t('login.title')}</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{i18n.t('login.phone')}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit phone number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{i18n.t('login.password')}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

<Text onPress={() => router.push("../FpoJourney/ForgotPasswordScreen")} style={styles.signupText}>{i18n.t('login.forgotPassword')}</Text>

        </View>
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>{i18n.t("login.loginButton")}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push("../FpoJourney/Signup")}>
          <Text style={styles.signupText}>{i18n.t("login.noAccount")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {i18n.t("common.byContinuing")}
        </Text>
      </View>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCF5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCF5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2B7A0B",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2B7A0B",
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2B7A0B",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#2B7A0B",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupText: {
    color: "#2B7A0B",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
});

export default LoginScreen;