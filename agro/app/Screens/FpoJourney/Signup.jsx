import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { useAuth } from '../../_layout';
import { useApi } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import statesData from './statedistrict.json';

import i18n from '../../languagejsons/i18n'; // Importing the i18n instance

// Define the API URL
const API_URL = 'https://agrodhara-18yb.onrender.com';

console.log("Platform:", Platform.OS, Platform.Version);

const SignupScreen = () => {
  const router = useRouter();
  const { register, isAuthenticated, isInitialAuthCheckComplete, isLoading } = useAuth();
  const api = useApi();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: FPO Details
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    fpo_name: "",
    email:"",
    legal_structure: "",
    whatsapp_enabled: "",
    incorporation_date: new Date().toISOString().split('T')[0],
    password: "",
    confirmPassword: "",
    registration_number: "",
    state: "",
    district: "",
    villages_covered: "",
    board_member_name:"",
    ceo_name: "",
    alternate_contact: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  // Temporary storage for tokens during signup process
  const [tempTokens, setTempTokens] = useState({
    accessToken: null,
    refreshToken: null
  });





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




  // Redirect to profile if already authenticated
  useEffect(() => {
    if (isInitialAuthCheckComplete && !isLoading && isAuthenticated && !redirecting) {
      console.log("Already authenticated, redirecting to profile");
      setRedirecting(true);
      
      const timer = setTimeout(() => {
        router.replace("/Screens/FpoJourney/Profile");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, isInitialAuthCheckComplete, redirecting]);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }
    
    try {
      // First check if user already exists
      const checkResponse = await api.get(`/api/auth/fpo/check-user-exists/${phone}`);
      
      if (checkResponse.data.exists) {
        // User exists - ask if they want to login instead
        Alert.alert(
          "Account Exists",
          "An account with this phone number already exists.",
          [
            {
              text: "Go to Login",
              onPress: () => router.replace("Screens/FpoJourney/Login")
            },
            {
              text: "Try Another Number",
              style: "cancel"
            },
            {
              text: "Continue Anyway",
              onPress: async () => {
                // If they want to continue, send OTP
                await api.post(`/api/auth/fpo/send-otp`, { phone });
                setStep(2);
                Alert.alert("OTP Sent", "Check your phone for verification code");
              }
            }
          ]
        );
        return;
      }
      
      // If user doesn't exist, proceed with OTP
      await api.post(`/api/auth/fpo/send-otp`, { phone });
      setStep(2);
      Alert.alert("OTP Sent", "Check your phone for verification code");
    } catch (error) {
      // If the check-user-exists endpoint doesn't exist, continue with normal flow
      if (error.response?.status === 404 && error.response?.data?.error?.includes("endpoint")) {
        try {
          await api.post(`/api/auth/fpo/send-otp`, { phone });
          setStep(2);
          Alert.alert("OTP Sent", "Check your phone for verification code");
        } catch (otpError) {
          const errorMessage = otpError.response?.data?.error || "Failed to send OTP";
          Alert.alert("Error", errorMessage);
        }
      } else {
        const errorMessage = error.response?.data?.error || "Failed to send OTP";
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }
    
    try {
      // Use the basic OTP verification endpoint (completely public)
      const response = await axios.post(`${API_URL}/api/auth/fpo/basic-verify-otp`, { 
        phone, 
        otp 
      });
      
      console.log("OTP verification response:", response.data);
      
      // Check if verification was successful
      if (response.data.verified) {
        // Check if user already exists
        if (response.data.userExists) {
          // User exists, redirect to login
          Alert.alert(
            "Account Found",
            "An account already exists with this phone number. Please login.",
            [
              {
                text: "Go to Login",
                onPress: () => {
                  router.replace("Screens/FpoJourney/Login");
                }
              }
            ]
          );
        } else {
          // OTP verification succeeded, proceed to form
          console.log("OTP verified, proceeding to registration form");
          
          // Store phone for later use
          await AsyncStorage.setItem('user_phone', phone);
          console.log('Stored user phone:', phone);
          
          // Move to the registration form
          setStep(3);
        }
      } else {
        // Verification failed
        Alert.alert("Verification Failed", response.data.message || "Could not verify OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error.response || error);
      const errorMessage = error.response?.data?.error || "Verification failed";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'dismissed') return;

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      console.log("Date selected:", formattedDate);
      handleChange("incorporation_date", formattedDate);
    }
  };

  const validateRequiredFields = () => {
    const requiredFields = [
      'fpo_name','email', 'legal_structure', 'incorporation_date','whatsapp_enabled', 'password',
      'registration_number', 'state', 'district', 'board_member_name',
      'ceo_name', 'alternate_contact'
    ];

    console.log("Current form data:", formData);
    
    const emptyFields = requiredFields.filter(field => !formData[field]?.trim());
    console.log("Empty fields:", emptyFields);
    
    if (emptyFields.length > 0) {
      Alert.alert(
        "Required Fields",
        `Please fill in the following fields:\n${emptyFields.join('\n')}`
      );
      console.log("Validation failed due to empty fields:", emptyFields);
      return false;
    }

    // Validate password
    console.log("Password match check:", {
      password: formData.password, 
      confirmPassword: formData.confirmPassword,
      matches: formData.password === formData.confirmPassword
    });
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match");
      console.log("Validation failed due to password mismatch");
      return false;
    }
    
    if (formData.password.length < 6) {
      Alert.alert("Password Error", "Password must be at least 6 characters");
      console.log("Validation failed due to password length");
      return false;
    }

    console.log("All validations passed");
    return true;
  };








 // State for selected state and districts
 const [selectedState, setSelectedState] = useState("");
 const [districts, setDistricts] = useState([]);

 // Effect to update districts based on selected state
 useEffect(() => {
   const stateData = statesData.states.find(state => state.state === selectedState);
   if (stateData) {
     setDistricts(stateData.districts);
     handleChange("district", ""); // Reset district when state changes
   } else {
     setDistricts([]);
   }
 }, [selectedState]);




  const handleSubmit = async () => {
    console.log("Submit button clicked");
    if (!validateRequiredFields()) {
      console.log("Validation failed");
      return;
    }

    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...dataToSubmit } = formData;
      
      // Ensure date is in correct format (YYYY-MM-DD)
      const formattedData = {
        ...dataToSubmit,
        phone,
        incorporation_date: new Date(dataToSubmit.incorporation_date).toISOString().split('T')[0]
      };
      
      console.log("Data to submit:", formattedData);
      
      // Use the direct-register endpoint which doesn't require authentication
      const response = await api.post('/api/auth/fpo/direct-register', formattedData);
      
      console.log("Direct registration response:", response.data);
      
      // Check both response.data.success and response.data format to handle different API responses
      if (response.data.success || response.data.id) {
        // Extract user ID from the response
        const userId = response.data.id || response.data.data?.id;
        
        if (userId) {
          console.log("Registration successful with ID:", userId);
          
          // Store user ID for future reference
          await AsyncStorage.setItem('userId', userId.toString());
          
          // Also store the entire registration data as backup
          await AsyncStorage.setItem('registration_data', JSON.stringify({
            ...formattedData,
            id: userId
          }));
          
          // Directly store user data before login attempt
          await AsyncStorage.setItem('user', JSON.stringify({
            ...formattedData,
            id: userId
          }));
        }
        
        // Try to login, but be prepared to navigate directly if needed
        try {
          // First try login with credentials
          await loginAfterRegistration(phone, formattedData.password);
        } catch (loginError) {
          console.error("Login after registration failed, navigating directly to profile:", loginError);
          
          // If login fails but we have a user ID, navigate directly to profile
          if (userId) {
            router.replace({
              pathname: "/Screens/FpoJourney/Profile",
              params: { fromSignup: true, userId: userId }
            });
          } else {
            // If no user ID, go to login
            Alert.alert(
              "Registration Successful",
              "Your account has been created. Please login.",
              [{ text: "Go to Login", onPress: () => router.replace("/Screens/FpoJourney/Login") }]
            );
          }
        }
      } else {
        console.error("API returned unsuccessful response", response.data);
        Alert.alert("Error", response.data.message || response.data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to create FPO profile";
      Alert.alert("Error", errorMessage);
    }
  };
  
  // Helper function to login after successful registration
  const loginAfterRegistration = async (phone, password) => {
    try {
      console.log("Attempting to login after registration");
      const loginResponse = await api.post('/api/auth/fpo/login', { phone, password });
      
      console.log("Login response:", loginResponse.data);
      
      // Extract data from response (handle different response formats)
      let responseData = loginResponse.data;
      if (loginResponse.data.data) {
        responseData = loginResponse.data.data;
      }
      
      // Handle different API response structures
      const accessToken = responseData.accessToken || responseData.access_token;
      const refreshToken = responseData.refreshToken || responseData.refresh_token;
      const fpoDetails = responseData.fpoDetails || responseData.fpo || responseData.user || responseData;
      
      if (accessToken && refreshToken) {
        console.log("Login successful, storing tokens and user data");
        
        // Ensure we have complete fpo details
        const userId = fpoDetails.id || await AsyncStorage.getItem('userId');
        
        // Store user ID and phone for future reference
        if (userId) await AsyncStorage.setItem('userId', userId.toString());
        await AsyncStorage.setItem('user_phone', phone);
        
        // Store tokens directly with await to ensure they're saved
        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
          ['user', JSON.stringify(fpoDetails)]
        ]);
        
        // Force the auth context to update with the new user data
        register({ accessToken, refreshToken }, fpoDetails);
        
        console.log("Successfully stored tokens and user data with ID:", userId);
        console.log("Forcing navigation to profile...");
        
        // Use direct Expo Router navigation - this should bypass any auth context delays
        router.replace({
          pathname: "/Screens/FpoJourney/Profile",
          params: { fromSignup: true, userId: userId }
        });
      } else {
        console.error("Token or user data missing in response:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasFpoDetails: !!fpoDetails
        });
        
        // If login fails, redirect to login page
        Alert.alert(
          "Login Required",
          "Please login with your credentials",
          [{ text: "OK", onPress: () => router.replace("/Screens/FpoJourney/Login") }]
        );
      }
    } catch (loginError) {
      console.error("Login after registration failed:", loginError);
      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please login.",
        [{ text: "Go to Login", onPress: () => router.replace("/Screens/FpoJourney/Login") }]
      );
    }
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.header}>{i18n.t("common.createNewFPOAccount")}</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{i18n.t("common.phoneNumber")}</Text>
            <View style={styles.phoneContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="10-digit phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSendOtp}>
            <Text style={styles.submitButtonText}>{i18n.t("forgotPassword.sendOtp")}   </Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>  {i18n.t("signup.haveAccount")}</Text>
            <TouchableOpacity onPress={() => router.replace("Screens/FpoJourney/Login")}>
              <Text style={styles.loginLink}> {i18n.t("login.loginButton")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.header}>{i18n.t("forgotPassword.verifyOtp")}</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{i18n.t("forgotPassword.enterOtp")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOtp}>
            <Text style={styles.submitButtonText}>{i18n.t("forgotPassword.verifyOtp")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendOtp}>
            <Text style={styles.resendText}>{i18n.t("forgotPassword.resendOtp")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>FPO Registration</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>FPO Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter FPO name"
            value={formData.fpo_name}
            onChangeText={(value) => handleChange("fpo_name", value)}
            maxLength={255}
          />
        </View>





        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={formData.email}
            onChangeText={(value) => handleChange("email", value)}
            maxLength={255}
          />
        </View>




        <Text style={styles.label}>Whatsapp Enabled*</Text>
        <View style={styles.pickerContainer}>
          
  <Picker
    selectedValue={formData.whatsapp_enabled}
    onValueChange={(value) => handleChange("whatsapp_enabled", value)}
    style={styles.picker}
    dropdownIconColor="#2B7A0B"
    itemStyle={styles.pickerItem}
  >
    <Picker.Item label="Select" value="" />
    <Picker.Item label="Yes" value="Yes" />
    <Picker.Item label="No" value="No" />
  </Picker>
</View>

<Text style={styles.label}>Legal Structure *</Text>
        <View style={styles.pickerContainer}>
          
          <Picker
            selectedValue={formData.legal_structure}
            onValueChange={(value) => handleChange("legal_structure", value)}
            style={styles.picker}
            dropdownIconColor="#2B7A0B"
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Select Legal Structure" value="" />
            <Picker.Item label="Cooperative" value="Cooperative" />
            <Picker.Item label="Company" value="Company" />
            <Picker.Item label="Society" value="Society" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Incorporation Date *</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
            value={formData.incorporation_date}
              placeholder="YYYY-MM-DD"
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
            value={new Date(formData.incorporation_date)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password (min 6 characters)"
            value={formData.password}
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry={!passwordVisible}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange("confirmPassword", value)}
            secureTextEntry={!confirmPasswordVisible}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>CIN Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter CIN number"
            value={formData.registration_number}
            onChangeText={(value) => handleChange("registration_number", value)}
            maxLength={50}
          />
        </View>




        <Text style={styles.label}>State *</Text>
        <View style={styles.pickerContainer}>
       
        <Picker
          selectedValue={selectedState}
          onValueChange={(value) => {
            setSelectedState(value);
            handleChange("state", value); // Update formData state
          }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#2B7A0B"
        >
          <Picker.Item label="Select State" value="" />
          {statesData.states.map((state, index) => (
            <Picker.Item key={index} label={state.state} value={state.state} />
          ))}
        </Picker>
      </View>








      <Text style={styles.label}>District *</Text>
      <View style={styles.pickerContainer}>
        
        <Picker
          selectedValue={formData.district}
          onValueChange={(value) => handleChange("district", value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#2B7A0B"
          enabled={districts.length > 0} // Disable if no districts available
        >
          <Picker.Item label="Select District" value="" />
          {districts.map((district, index) => (
            <Picker.Item key={index} label={district} value={district} />
          ))}
        </Picker>
      </View>







        <View style={styles.formGroup}>
          <Text style={styles.label}>Block Name</Text>
          <TextInput
          style={styles.input}
            placeholder="Enter Block Name"
            value={formData.villages_covered}
            onChangeText={(value) => handleChange("villages_covered", value)}
          multiline
          />
        </View>


        

        <View style={styles.formGroup}>
        <Text style={styles.label}>CEO Name *</Text>
          <TextInput
            style={styles.input}
          placeholder="Enter CEO name"
            value={formData.ceo_name}
            onChangeText={(value) => handleChange("ceo_name", value)}
            maxLength={255}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Board Member Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Board Member Name"
            value={formData.board_member_name}
            onChangeText={(value) => handleChange("board_member_name", value)}
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Board Member Contact Number</Text>
          <TextInput
            style={styles.input}
          placeholder="Enter 10-digit alternate number"
            value={formData.alternate_contact}
            onChangeText={(value) => handleChange("alternate_contact", value)}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Register FPO</Text>
        </TouchableOpacity>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FFF8',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A5D1A",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subheader: {
    fontSize: 16,
    color: "#5A8F5A",
    textAlign: "center",
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#1A5D1A",
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D8E8D8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1A3A1A",
    shadowColor: "#1A5D1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  focusedInput: {
    borderColor: "#1A5D1A",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D8E8D8",
    borderRadius: 12,
    paddingLeft: 16,
    shadowColor: "#1A5D1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  prefix: {
    fontSize: 16,
    color: "#1A5D1A",
    marginRight: 8,
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#1A3A1A",
  },
  buttonContainer: {
    marginTop: 30,
    shadowColor: "#1A5D1A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButton: {
    backgroundColor: "#1A5D1A",
    padding: 18,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },
  submitButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginLeft: 10,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: "#1A5D1A",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  resendLink: {
    color: "#1A5D1A",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  loginText: {
    color: "#5A8F5A",
    fontSize: 15,
  },
  loginLink: {
    color: "#1A5D1A",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 15,
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  successText: {
    color: "#1A5D1A",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8E8D8',
  },
  dividerText: {
    color: '#5A8F5A',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D8E8D8',
    shadowColor: "#1A5D1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },






  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D8E8D8",
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 54, 
    width: '100%',
    color: "#1A3A1A",
  },
  pickerItem: {
    fontSize: 17,
    color: "#1A3A1A",
    
  },
});

export default SignupScreen; 