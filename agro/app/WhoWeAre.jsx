import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './languagejsons/i18n';
import { scheduleWelcomeNotification } from './services/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const WhoWeAre = () => {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const fadeAnim = new Animated.Value(0);
  const buttonScale = new Animated.Value(1);
  const glowAnim = new Animated.Value(0);

  // Animation sequences
  useEffect(() => {
    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulsing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);



  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
        i18n.locale = storedLanguage;
      }
    };
    loadLanguage();
  }, []);

  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  const handleNext = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace('Screens/FpoJourney/HomePage');
    });
  };

  const glowInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0px 0px 0px rgba(76, 175, 80, 0)', '0px 0px 20px rgba(102, 255, 102, 0.8)'],
  });

  return (
    <LinearGradient
      colors={['#f0fff0', '#e0ffe0']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View 
          style={[
            styles.header,
            {
              shadowOpacity: glowAnim,
              shadowRadius: 15,
              shadowColor: '#66ff66',
            }
          ]}
        >
          <LinearGradient
            colors={['#2E7D32', '#4CAF50', '#66BB6A']}
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.title}>{i18n.t('whoweare.title')}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              {i18n.t('whoweare.intro')}
            </Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info" size={24} color="#66ff66" />
              <Text style={styles.subTitle}>{i18n.t('whoweare.aboutUsTitle')}</Text>
            </View>
            <Text style={styles.paragraph}>
              {i18n.t('whoweare.aboutUsDescription')}
            </Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="flag" size={24} color="#66ff66" />
              <Text style={styles.subTitle}>{i18n.t('whoweare.missionTitle')}</Text>
            </View>
            <Text style={styles.paragraph}>
              {i18n.t('whoweare.missionDescription')}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="remove-red-eye" size={24} color="#66ff66" />
              <Text style={styles.subTitle}>{i18n.t('whoweare.visionTitle')}</Text>
            </View>
            <Text style={styles.paragraph}>
              {i18n.t('whoweare.visionDescription')}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.nextButtonContainer,
          { transform: [{ scale: buttonScale }] }
        ]}
      >
        <TouchableOpacity 
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>{i18n.t('common.next')}</Text>
            <MaterialIcons name="arrow-forward" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  gradientHeader: {
    width: '100%',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    borderRadius: 0,
    marginBottom: 20,
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 22,
    color: '#2E7D32',
    marginLeft: 10,
    fontWeight: '600',
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 5,
  },
  nextButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default WhoWeAre;