import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../services/config';

const FarmerProfilePage = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Get the farmer ID from the route parameters
    const [farmerData, setFarmerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFarmerData = async () => {
            try {
                console.log(`Fetching farmer data for ID: ${id}`);
                
                // Use a direct GET request without authentication token
                const response = await fetch(`${API_BASE_URL}/api/farmer/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log(`API response status: ${response.status}`);
                
                if (!response.ok) {
                    console.error(`Error response: ${response.status} ${response.statusText}`);
                    throw new Error(`Failed to fetch farmer data: ${response.status}`);
                }

                const data = await response.json();
                console.log('Farmer data response:', data);
                
                if (data.success) {
                    setFarmerData(data.farmer);
                } else {
                    Alert.alert('Error', data.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('Error fetching farmer data:', error);
                Alert.alert('Error', 'An error occurred while fetching your profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchFarmerData();
    }, [id, router]);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('farmerId');
            await AsyncStorage.removeItem('farmerName');
            
            router.replace('/Screens/FarmerJourney/Login');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!farmerData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No profile data found.</Text>
                <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => router.replace('/Screens/FarmerJourney/Login')}
                >
                    <Text style={styles.loginButtonText}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image source={require('../../../assets/images/button3.png')} style={styles.logo} />
                    <View style={styles.profileContainer}>
                        <Image source={require('../../../assets/images/button3.png')} style={styles.profileImage} />
                    </View>
                </View>

                {/* Welcome & Weather Section */}
                <View style={styles.welcomeWeatherContainer}>
                    <View style={styles.welcomeSection}>
                        <Text style={styles.greeting}>Hi {farmerData.farmer_name || 'Farmer'}!</Text>
                        <Text style={styles.subText}>Welcome to Agrodhara</Text>
                    </View>

                    <View style={styles.weatherContainer}>
                        <View style={styles.weatherTextContainer}>
                            <Text style={styles.weatherText}>18°C</Text>
                            <Text style={styles.weatherSubText}>Cloudy</Text>
                            <Text style={styles.weatherSubText}>{farmerData.district_name || 'Your Location'}</Text>
                            <Text style={styles.weatherSubText}>Sunday 7:37 AM</Text>
                        </View>
                        <Ionicons name="partly-sunny-outline" size={30} color="#FFD700" style={styles.weatherIcon} />
                    </View>
                </View>

                {/* Farm Details Section */}
                <View style={styles.farmDetails}>
                    <Text style={styles.farmTitle}>Farm Details</Text>
                    <View style={styles.farmRow}>
                        <View>
                            <Text style={styles.farmLabel}>Location: {farmerData.village_name || 'N/A'}</Text>
                            <Text style={styles.farmLabel}>Area: {farmerData.total_plot_size || 'N/A'} {farmerData.total_plot_unit || 'Acre'}</Text>
                            <Text style={styles.farmLabel}>Primary Crop: {farmerData.crop_variety || 'N/A'}</Text>
                        </View>
                        <View>
                            <Text style={styles.farmLabel}>Soil Type: {farmerData.soil_type || 'N/A'}</Text>
                            <Text style={styles.farmLabel}>Years Farming: {farmerData.years_in_farming || 'N/A'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.moreText}>More...</Text>
                    </TouchableOpacity>
                </View>

                {/* FPO Details Section */}
                <View style={styles.farmDetails}>
                    <Text style={styles.farmTitle}>FPO Details</Text>
                    <View style={styles.fpoDetailsContent}>
                        <Text style={styles.farmLabel}>FPO Name: {farmerData.fpo_name || 'N/A'}</Text>
                        <Text style={styles.farmLabel}>State: {farmerData.fpo_state || farmerData.state_name || 'N/A'}</Text>
                        <Text style={styles.farmLabel}>District: {farmerData.fpo_district || farmerData.district_name || 'N/A'}</Text>
                    </View>
                </View>

                {/* Buttons Section */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.topButton}>
                        <FontAwesome5 name="book" size={40} color="green" />
                        <Text style={styles.buttonText}>Ledger</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topButton}>
                        <FontAwesome5 name="truck" size={40} color="green" />
                        <Text style={styles.buttonText}>My Orders</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button}>
                        <FontAwesome5 name="file-alt" size={40} color="green" />
                        <Text style={styles.buttonText}>Terms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <FontAwesome5 name="headset" size={40} color="green" />
                        <Text style={styles.buttonText}>Support</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <FontAwesome5 name="sign-out-alt" size={40} color="green" />
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0FFE0', padding: 15, width: '100%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    logo: { width: 60, height: 40, resizeMode: 'contain' },
    profileContainer: { borderRadius: 50, overflow: 'hidden' },
    profileImage: { width: 40, height: 40, borderRadius: 50 },

    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F0FFE0',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#4CAF50',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0FFE0',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#d32f2f',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    welcomeWeatherContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    welcomeSection: {
        flex: 1,
    },
    greeting: { fontSize: 20, fontWeight: 'bold' },
    subText: { fontSize: 14, color: 'gray' },

    weatherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    weatherTextContainer: {
        marginRight: 10,
    },
    weatherText: { fontSize: 16, fontWeight: 'bold' },
    weatherSubText: { fontSize: 12, color: 'gray' },
    weatherIcon: { marginLeft: 5 },

    farmDetails: {
        padding: 15,
        backgroundColor: '#F5FFFA',
        borderRadius: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    farmTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    farmRow: { flexDirection: 'row', justifyContent: 'space-between' },
    farmLabel: { fontSize: 14, color: '#333', marginBottom: 8 },
    moreText: { color: 'green', marginTop: 5, textAlign: 'right', fontWeight: '600' },
    
    fpoDetailsContent: {
        paddingVertical: 5,
    },

    /* Buttons */
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
    topButton: {
        backgroundColor: 'white',
        paddingVertical: 25,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    button: { 
        backgroundColor: 'white', 
        padding: 25, 
        borderRadius: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '28%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
    },
    buttonText: { fontSize: 14, color: '#333', marginTop: 8, fontWeight: '500' },
});

export default FarmerProfilePage;