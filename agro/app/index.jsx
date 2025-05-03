import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './_layout';
import { RadioButton } from 'react-native-paper';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "./languagejsons/i18n"; // Importing the i18n instance






const HomeScreen = () => {
  const router = useRouter();
  const { isAuthenticated, isInitialAuthCheckComplete, isLoading } = useAuth();
  const [_, forceUpdate] = useState(false);



  // State for language selection
  const [language, setLanguage] = useState('en'); // Default to English

  // Load language from AsyncStorage on component mount
  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
      } else {
        const deviceLanguage = getLocales()[0].languageCode || 'en';
        setLanguage(deviceLanguage);
      }
    };
    loadLanguage();
  }, []);

  // Update i18n locale and load translations when language state changes
  useEffect(() => {
    i18n.locale = language; // Set the current locale
    AsyncStorage.setItem('language', language); // Save selected language to AsyncStorage
    forceUpdate(prev => !prev); // Force re-render
  }, [language]);

  // Redirect to profile if already logged in
  useEffect(() => {
    if (isInitialAuthCheckComplete && !isLoading) {
      if (isAuthenticated) {
        console.log("User  authenticated, redirecting to profile");
        setTimeout(() => {
          router.replace("Screens/FpoJourney/Profile");
        }, 300);
      } else {
        console.log("User  not authenticated, staying on home screen");
      }
    }
  }, [isAuthenticated, isInitialAuthCheckComplete, isLoading]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B7A0B" />
        <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
    source={require('../assets/images/bgindex2.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>Growing Together, Thriving Together</Text>
      </View>

    
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={() => router.replace('WhoWeAre')}
        >
          <Text style={styles.getStartedText}>{i18n.t('common.getstarted')}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCF5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2B7A0B',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150 },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B7A0B',
    marginTop: 0,
  },
  languageSelector: {
    marginVertical: 20,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#2B7A0B',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;