import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Image, FlatList, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from '../../_layout';
import { useApi } from '../../services/api';
import * as Location from 'expo-location';
import DistrictFactsCarousel from './Districtfactscarousel';
import { AntDesign } from '@expo/vector-icons';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../languagejsons/i18n'; // Importing the i18n instance

const Test = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, logout, isAuthenticated, isLoading, isInitialAuthCheckComplete } = useAuth();
  const api = useApi();
  const [profile, setProfile] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [districtFacts, setDistrictFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [redirecting, setRedirecting] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState(null);
  const [weather, setWeather] = useState(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const flatListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);


  const checkTokens = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
  
      if (accessToken && refreshToken) {
        console.log('✅ Tokens are present in AsyncStorage.');
      } else {
        console.log('❌ One or both tokens are missing in AsyncStorage.');
        // Redirect to home page if tokens are missing
        router.replace('/Screens/FpoJourney/Login');
      }
    } catch (error) {
      console.error('Error checking tokens:', error);
    }
  };
  
  useEffect(() => {
    checkTokens();
  }, []);

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





  
  // Check if we're coming directly from signup
  const fromSignup = params.fromSignup === 'true';
  const paramUserId = params.userId;
  
  console.log("Profile params:", params);
  console.log("Profile data:", profile);

  const orders = [
    {
      product: "Kalanamak",
      quantity: 10, // in kg
      pricePerKg: 500, // in INR
      totalPrice: 10 * 500
    },
    {
      product: "Fox Nuts",
      quantity: 15, // in kg
      pricePerKg: 800, // in INR
      totalPrice: 15 * 800
    }
  ];

  console.log(orders);

  // Check authentication and redirect if needed - but only if not coming from signup
  useEffect(() => {
    if (!fromSignup && isInitialAuthCheckComplete && !isLoading && !isAuthenticated && !redirecting) {
      console.log("Not authenticated, redirecting to login");
      setRedirecting(true);
      
      const timer = setTimeout(() => {
        router.replace("Screens/FpoJourney/Login");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, isInitialAuthCheckComplete, redirecting, fromSignup]);

  // Get location and weather when component mounts
  useEffect(() => {
    (async () => {
      console.log("Requesting location permissions...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        console.log('Location permission denied');
        return;
      }

      console.log("Getting current location...");
      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        
        setLocation(currentLocation);
        console.log("Location data:", {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          altitude: currentLocation.coords.altitude,
          timestamp: currentLocation.timestamp
        });

        // Fetch weather for current location
        await fetchWeatherData(currentLocation.coords.latitude, currentLocation.coords.longitude);

        // Get location address details
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          
          if (reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            console.log("Address information:", {
              city: address.city,
              country: address.country,
              district: address.district,
              isoCountryCode: address.isoCountryCode,
              name: address.name,
              postalCode: address.postalCode,
              region: address.region,
              street: address.street,
              subregion: address.subregion,
              timezone: address.timezone
            });
          }
        } catch (geocodeError) {
          console.error("Error getting address:", geocodeError);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationErrorMsg('Failed to get location');
      }
    })();
  }, []);
  useEffect(() => {
    async function fetchFacts() {
      try {
        const response = await api.get('/api/fpo/facts'); // Replace with actual API endpoint
        const data = response.data;
        setDistrictFacts(
          data.find((d) => d.district === profile.district)?.highlights || ['No facts available for this district.']
        );
      } catch (err) {
        console.error(err);
        setDistrictFacts(['Failed to load facts.']);
      } finally {
        setLoading(false);
      }
    }

    if (profile?.district) {
      fetchFacts();
    }
  }, [profile?.district]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loadProfileData();
    }
  }, [isLoading, isAuthenticated]);

  // Initialize profile from auth context or API
  const loadProfileData = async () => {
    try {
      // If user ID is provided from navigation param (optional), use it
      if (paramUserId) {
        console.log("Using user ID from URL params:", paramUserId);
        await fetchProfileById(paramUserId);
        return;
      }
  
      // If you have a logged-in user from context, optionally use that
      // Otherwise, just fetch profile using the token
      console.log("No param userId, fetching profile with token");
      await fetchProfile();
    } catch (error) {
      console.error("Error loading profile data:", error);
      setLocalLoading(false);
    }
  };


  

  const fetchProfileById = async (userId) => {
    try {
      console.log("Fetching profile data by ID:", userId);
  
      // First attempt
      try {
        const response = await api.get(`/api/fpo/${userId}`);
        const profileData = response.data.data || response.data.fpoDetails || response.data;
        console.log("Profile data received:", profileData);
        setProfile(profileData);
        setLocalLoading(false);
        return;
      } catch (error) {
        console.log("First endpoint failed, trying alternative:", error.message);
      }
  
      // Second attempt
      try {
        const response = await api.get(`/api/auth/fpo/profile/${userId}`);
        const profileData = response.data.data || response.data.fpoDetails || response.data;
        console.log("Profile data received from alt endpoint:", profileData);
        setProfile(profileData);
        setLocalLoading(false);
        return;
      } catch (error) {
        console.log("Second endpoint also failed:", error.message);
      }
  
      // Fallback
      await fetchProfile();
    } catch (error) {
      console.error("Error fetching profile by ID:", error.message);
      await fetchProfile();
    } finally {
      setLocalLoading(false);
    }
  };

  const fetchProfile = async () => {
  try {
    console.log("Fetching profile data");
    const response = await api.get(`/api/fpo/profile`, { timeout: 7000 });
    const profileData = response.data.data || response.data;
    console.log("Profile data received:", profileData);
    setProfile(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error.message);

    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isNetworkError = !error.response;

    if (isAuthError || isNetworkError) {
      // Automatically logout and redirect to login page without showing alert
      handleLogout();  // Make sure this clears auth state and redirects
    } else {
      Alert.alert("Error", "Failed to load profile");
    }
  } finally {
    setLocalLoading(false);
  }
};

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

  const handleEdit = () => {
    router.push(`./EditFpoProfile?id=${profile.id}`);
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    try {
      const response = await api.post(
        `/api/fpo/profile/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Password changed successfully");
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to change password";
      Alert.alert("Error", errorMessage);
    }
  };
  const fetchWeatherData = async (latitude, longitude) => {
    setFetchingWeather(true);
    try {
      console.log("Fetching weather data for:", latitude, longitude);
  
     
  
      // Get the access token from AsyncStorage (this can be done through the `useApi` hook as well)
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('No access token available');
        // Handle the case where no access token is found (redirect to login, etc.)
        return;
      }
  
      // First, try getting weather data from your backend API
      try {
        const backendResponse = await api.get(`/api/weather?lat=${latitude}&lon=${longitude}`, {
          headers: {
            Authorization: `Bearer ${accessToken}` // Add the Bearer token here
          }
        });
        if (backendResponse.data && backendResponse.data.success) {
          console.log("Weather data received from backend:", backendResponse.data);
          setWeather(backendResponse.data);
          setFetchingWeather(false);
          return;
        }
      } catch (backendError) {
        console.log("Backend weather API failed, trying direct call:", backendError);
      }
  
      // If the backend call fails, try the OpenWeatherMap API with the same Bearer token
      const API_KEY = "ba672f0677f53bb0fd9bb2824773d50a"; // OpenWeatherMap API Key (public)
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
  
      console.log("Weather API URL:", url);
  
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}` // Add the Bearer token here if needed (for external APIs requiring auth)
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Weather data received from direct API:", data);
        setWeather(data);
      } else {
        const errorText = await response.text();
        console.error("Weather API error:", response.status, errorText);
  
        // Use mock weather data if API call fails
        console.log("Using mock weather data due to API error");
        setWeather({
          name: "Your Location",
          main: {
            temp: 25,
            feels_like: 26,
            humidity: 60,
          },
          weather: [
            {
              main: "Clear",
              description: "clear sky",
              icon: "01d",
            },
          ],
          wind: {
            speed: 3.5,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      // Use mock data as fallback
      setWeather({
        name: "Your Location",
        main: {
          temp: 25,
          feels_like: 26,
          humidity: 60,
        },
        weather: [
          {
            main: "Clear",
            description: "clear sky",
            icon: "01d",
          },
        ],
        wind: {
          speed: 3.5,
        },
      });
    } finally {
      setFetchingWeather(false);
    }
  };
  

  // Function to get weather icon URL with fallback
  const getWeatherIconUrl = (iconCode) => {
    if (!iconCode) return 'https://openweathermap.org/img/wn/01d@2x.png'; // Default to clear sky
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };




  
  const refreshWeatherAndLocation = async () => {
    try {
      setFetchingWeather(true);
      
      console.log("Refreshing location and weather data...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        Alert.alert(
          "Location Permission Required", 
          "Please enable location services to get weather for your current location."
        );
        return;
      }
      
      setLocationErrorMsg(null);
      
      // Get current location with timeout
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000 // 15 second timeout
      });
      
      // Set a timeout in case location takes too long
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Location request timed out')), 20000)
      );
      
      try {
        // Race between location fetch and timeout
        const loc = await Promise.race([locationPromise, timeoutPromise]);
        setLocation(loc);
        console.log("Location refreshed:", loc.coords);
        
        // Now fetch weather with the new location
        await fetchWeatherData(loc.coords.latitude, loc.coords.longitude);
        console.log("Weather data refreshed");
      } catch (timeoutErr) {
        console.error("Location timeout error:", timeoutErr);
        Alert.alert(
          "Location Error", 
          "Could not get your current location. Using last known location or default."
        );
        
        // If we have a previous location, use that
        if (location) {
          await fetchWeatherData(location.coords.latitude, location.coords.longitude);
        } else {
          // Use a default location (example: Mumbai)
          await fetchWeatherData(19.076, 72.8777);
        }
      }
    } catch (err) {
      console.error("Error refreshing location and weather:", err);
      setLocationErrorMsg('Failed to refresh data');
      Alert.alert(
        "Weather Update Failed", 
        "We couldn't update the weather information. Please  later."
      );
    } finally {
      setFetchingWeather(false);
    }
  };

  // Show loading when the auth system is still initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B7A0B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show a loading indicator while we fetch the profile data
  if (localLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B7A0B" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }



  return (
    <>
    <ScrollView style={styles.container}>
     
      
      {/* Original profile header - keep it or remove it as needed */}
      <View style={styles.header}>
        <Text style={styles.title}>FPO Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>


 {/* New Header with Logo and Weather */}
 <View style={styles.section}>
  <View style={styles.headerContent}>
    <View style={styles.greetingContainer}>
      <Text style={styles.greetingText}>Hi {profile?.fpo_name || 'User'}!</Text>
      <Text style={styles.welcomeText}>{i18n.t('common.welcome')}</Text>
    </View>
    
    <View style={styles.weatherContainer}>
      <View style={styles.weatherTopRow}>
        <View style={styles.weatherInfo}>
          <Text style={styles.temperature}>{Math.round(weather?.main?.temp || 0)}°C</Text>
          <Text style={styles.weatherCondition}>
            {weather?.weather?.[0]?.main || 'Weather'}
          </Text>
        </View>
        <Image 
          source={{ uri: getWeatherIconUrl(weather?.weather?.[0]?.icon) }}
          style={styles.weatherIcon}
          defaultSource={require('../../../assets/images/AppLogo.jpg')}
        />
      </View>
      <View style={styles.weatherBottomRow}>
        <Text style={styles.weatherLocation}>
          {weather?.name || 'Your Location'}, {profile?.district || 'State'}
        </Text>
        <Text style={styles.weatherTime}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long' })} {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
        </Text>
      </View>
    </View>
  </View>
</View>






<View style={styles.section}>

<DistrictFactsCarousel districtFacts={districtFacts} loading={loading} />

</View>



      {profile ? (
        <>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Trades</Text>
            {orders.length > 0 ? (
              <View style={styles.cardCarousel}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => setCurrentTradeIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentTradeIndex === 0}>
                  <Text style={[styles.navButtonText, currentTradeIndex === 0 && styles.disabledNav]}>◀</Text>
                </TouchableOpacity>
                
                <View style={styles.cleanCardWrapper}>
                  <View style={styles.cleanCard}>
                    {/* Left column - icon and product name */}
                    <View style={styles.cardTop}>
                      <View style={styles.productIconWrapper}>
                        <Text style={styles.productLetter}>{orders[currentTradeIndex].product.charAt(0)}</Text>
                      </View>
                      <Text style={styles.productName}>{orders[currentTradeIndex].product}</Text>
                    </View>
                    
                    {/* Middle column - info */}
                    <View style={styles.cardInfo}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Quantity</Text>
                        <Text style={styles.infoValue}>{orders[currentTradeIndex].quantity} kg</Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Price</Text>
                        <Text style={styles.infoValue}>₹{orders[currentTradeIndex].pricePerKg}/kg</Text>
                      </View>
                      
                      <View style={styles.totalInfo}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{orders[currentTradeIndex].totalPrice}</Text>
                      </View>
                    </View>
                    
                    {/* Right button */}
                    <TouchableOpacity 
                      style={styles.notifyBtn}
                      onPress={() => {
                        const message = `Notifications sent to all farmers related to ${orders[currentTradeIndex].product} order.`;
                        
                        if (Platform.OS === 'web') {
                          // Use browser's native alert for web
                          window.alert("Notification Sent\n\n" + message);
                        } else {
                          // Use React Native's Alert for mobile
                          Alert.alert(
                            "Notification Sent", 
                            message
                          );
                        }
                        console.log("Notification sent:", message);
                      }}
                    >
                      <AntDesign name="notification" size={12} color="white" />
                    </TouchableOpacity>
                    
                    <Text style={styles.paginationText}>{currentTradeIndex + 1}/{orders.length}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => setCurrentTradeIndex(prev => Math.min(orders.length - 1, prev + 1))}
                  disabled={currentTradeIndex === orders.length - 1}>
                  <Text style={[styles.navButtonText, currentTradeIndex === orders.length - 1 && styles.disabledNav]}>▶</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.label}>Nothing Sold So far</Text>
            )}
          </View>


          <TouchableOpacity onPress={() => {
    console.log(profile.id); // Log the profile ID
    router.push(`/Screens/FpoJourney/AddFarmer?id=${profile.id}`); // Navigate to AddFarmer screen
}}>
          <View style={styles.Farmerssection}>
      
          <Image 
                source={require('../../../assets/images/farmerbutton.png')}
                style={styles.FarmerbuttonImage}
                resizeMode="contain"
              />
            <Text style={styles.sectionTitleFarmer}>Farmers</Text>
            
          </View>
          </TouchableOpacity>








          <View style={styles.buttonGridContainer}>
        <Text style={styles.buttonGridTitle}>Quick Actions</Text>
        
        <View style={styles.buttonGrid}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#FF5252' }]}
              onPress={() => { router.push('/Screens/FpoJourney/MyFarm');}}
            >
              <Image 
                source={require('../../../assets/images/button1.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#FF9800' }]}
            >
              <Image 
                source={require('../../../assets/images/button2.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            



            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#FFEB3B' }]}
              onPress={() => { 
                console.log("Navigating to ContactUs page");
                router.push("/Screens/FpoJourney/ContactUs");
              }}
            >
        
              <Image 
                source={require('../../../assets/images/button3.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
             
            </TouchableOpacity>
            
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#4CAF50' }]}
              onPress={() => { console.log('Button 4 clicked'); Alert.alert('Button 4', 'Button 4 clicked!'); }}
            >
              <Image 
                source={require('../../../assets/images/button4.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#2196F3' }]}
       
            >
              <Image 
                source={require('../../../assets/images/button5.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#673AB7' }]}
              onPress={handleLogout}
            >
              <Image 
                source={require('../../../assets/images/button6.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#E91E63' }]}
              onPress={() => { router.push(`/Screens/FpoJourney/Product?id=${profile.id}`);}}
            >
              <Image 
                source={require('../../../assets/images/button7.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#9C27B0' }]}
              onPress={() => {  router.push("/Screens/FpoJourney/Terms"); }}
            >
              <Image 
                source={require('../../../assets/images/button8.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            

          
         

            <TouchableOpacity 
              style={[styles.gridButton, { borderColor: '#009688' }]}

             
            >
              <Image 
                source={require('../../../assets/images/button9.png')}
                style={styles.buttonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>





         

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.noProfile}>
          <Text style={styles.noProfileText}>
            No profile information available.
          </Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      )}
      

      {/* Grid of 3x3 Buttons */}
      
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCF5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2B7A0B",
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  Farmerssection:{
    backgroundColor: "#FFFFFF",
    maxHeight:"100",
    overflow:"hidden",
    margin: 10,
    padding: 25,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    justifyContent:"center",
    alignItems:"center",

  },
  

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2B7A0B",
    marginBottom: 10,
  },


  sectionTitleFarmer:{
    fontSize: 18,
    fontWeight: "600",
    color: "#2B7A0B",
    marginBottom: 10,
textAlign:"center"
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  label: {
    flex: 2,
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  value: {
    flex: 3,
    fontSize: 16,
    color: "#333333",
  },
  editButton: {
    backgroundColor: "#2B7A0B",
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noProfile: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noProfileText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2B7A0B",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  changePasswordButton: {
    backgroundColor: "#F5FCF5",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2B7A0B",
    alignItems: "center",
  },
  changePasswordText: {
    color: "#2B7A0B",
    fontSize: 16,
    fontWeight: "600",
  },
  passwordButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  saveButton: {
    backgroundColor: "#2B7A0B",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666666",
  },
  buttonGridContainer: {
    margin: 15,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  buttonGridTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2B7A0B",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
  },
  buttonGrid: {
    width: '100%',
    aspectRatio: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  gridButton: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 10,
    
   
  
  },
  buttonImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },

  FarmerbuttonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  newHeader: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  weatherContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft:"15px"
  },
  weatherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  weatherInfo: {
    alignItems: 'flex-start',
    marginRight: 8,
  },
  weatherBottomRow: {
    alignItems: 'flex-start',
  },
  weatherIcon: {
    width: 35,
    height: 35,
  },
  temperature: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#000000',
    marginTop: 1,
  },
  weatherLocation: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 1,
  },
  weatherTime: {
    fontSize: 11,
    color: '#666666',
  },
  cardCarousel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  cleanCardWrapper: {
    width: '85%',
    paddingHorizontal: 8,
  },
  cleanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 70,
  },
  productIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2B7A0B10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  productLetter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B7A0B',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  infoColumn: {
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  totalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B7A0B',
  },
  notifyBtn: {
    backgroundColor: '#FF3B30',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  notifyBtnText: {
    display: 'none',
  },
  paginationText: {
    fontSize: 10,
    color: '#999',
    position: 'absolute',
    bottom: 3,
    right: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#2B7A0B',
    fontWeight: '600',
  },
  disabledNav: {
    color: '#CCC',
  },


  factsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32', // fresh green
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  factItem: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 6,
    lineHeight: 20,
    paddingLeft: 8,
  },



  
});

export default Test; 