import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../_layout';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../languagejsons/i18n'; // Importing the i18n instance

const HomeScreen = () => {
  const router = useRouter();
  const { isAuthenticated, isInitialAuthCheckComplete, isLoading } = useAuth();
  


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




  // Redirect to profile if already logged in
  useEffect(() => {
    if (isInitialAuthCheckComplete && !isLoading) {
      if (isAuthenticated) {
        console.log("User authenticated, redirecting to profile");
        // Use router navigation for all platforms consistently
        setTimeout(() => {
          router.replace("Screens/FpoJourney/Profile");
        }, 300);
      } else {
        console.log("User not authenticated, staying on home screen");
      }
    }
  }, [isAuthenticated, isInitialAuthCheckComplete, isLoading]);
  
  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B7A0B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/images/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>{i18n.t('common.welcome')}</Text>
      </View>
      
      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card1}
          onPress={() => router.replace('Screens/FpoJourney/Login')}
        >
          <Image 
            source={require('../../../assets/images/fpo.png')} 
            style={styles.cardImage}
            resizeMode="contain"
          />

        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card2}
          onPress={() => router.replace('Screens/FarmerJourney/Login')}
        >
          <Image 
            source={require('../../../assets/images/farmer.png')} 
            style={styles.cardImage}
            resizeMode="contain"
          />
         
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCF5',
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
    height: 150,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B7A0B',
    marginTop: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  card1: {
    backgroundColor: '#eef6ff',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  card2: {
    backgroundColor: '#EAF3DB',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardImage: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B7A0B',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;