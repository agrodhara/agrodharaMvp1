import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing
} from "react-native";
import { api } from "../../services/api";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState("number"); // 'number', 'otp', 'newPassword'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [shakeAnimation] = useState(new Animated.Value(0));
  
  // Create refs for each OTP input
  const otpInputRefs = useRef([]);

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const sendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      startShake();
      Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number");
      return;
    }
  
    if (isSendingOtp) return; // prevent multiple presses
  
    setIsSendingOtp(true);
    try {
      const response = await api.post("/api/auth/fpo/send-otp", {
        phone: phoneNumber,
      });
  
      if (response.data.success) {
        Alert.alert("OTP Sent", "Check your phone for the OTP.");
        setStep("otp");
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join("");
    if (!otpString || otpString.length < 6) {
      startShake();
      Alert.alert("Invalid OTP", "Please enter the 6-digit OTP");
      return;
    }

    try {
      const response = await api.post("/api/auth/fpo/verify-otp", {
        phone: phoneNumber,
        otp: otpString,
      });

      if (response.data.success) {
        Alert.alert("OTP Verified", "Enter your new password");
        setStep("newPassword");
      } else {
        Alert.alert("Invalid OTP", response.data.message || "Please try again");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Error", "Something went wrong while verifying OTP");
    }
  };

  const router = useRouter();
  const handlePasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      startShake();
      Alert.alert("Weak Password", "Password must be at least 6 characters long");
      return;
    }
  
    try {
      const response = await api.post('/api/auth/fpo/forgotpassword', {
        phone: phoneNumber,
        newPassword,
      });
  
      if (response.data.success) {
        Alert.alert("Success", "Password has been reset!");
        console.log("✅ Password updated for:", phoneNumber);
        router.replace('/Screens/FpoJourney/Login');
      } else {
        Alert.alert("Error", response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to reset password");
    }
  };

  const handleOtpChange = (text, index) => {
    // Update the OTP array with the new value
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus to next input if a digit was entered
    if (text && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }

    // Auto focus to previous input if digit was deleted (except for first input)
    if (!text && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/Logo.png')} // Replace with your actual image path
            style={styles.logo}
          />
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            {step === "number" 
              ? "Enter your registered phone number" 
              : step === "otp" 
              ? `We sent a code to ${phoneNumber}` 
              : "Create a new password"}
          </Text>
        </View>

        <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnimation }] }]}>
          {step === "number" && (
            <>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="Phone Number"
                placeholderTextColor="#8e9a9d"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <TouchableOpacity 
                style={[styles.primaryButton, isSendingOtp && { opacity: 0.6 }]} 
                onPress={sendOtp} 
                disabled={isSendingOtp}
              >
                <Text style={styles.buttonText}>
                  {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <View style={styles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputRefs.current[index] = ref)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    placeholder="•"
                    placeholderTextColor="#8e9a9d"
                    maxLength={1}
                    value={otp[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                        otpInputRefs.current[index - 1].focus();
                      }
                    }}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={verifyOtp}>
                <Text style={styles.buttonText}>Verify OTP</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "newPassword" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#8e9a9d"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Text style={styles.passwordHint}>Password must be at least 6 characters</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordSubmit}>
                <Text style={styles.buttonText}>Reset Password</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => step === "number" ? router.back() : setStep("number")}
        >
          <Text style={styles.backButtonText}>
            {step === "number" ? "Back to Login" : "Back"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5fbf7",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2a5c4a",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b8a7d",
    textAlign: "center",
    maxWidth: 300,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1e3dc",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: "#2a5c4a",
    shadowColor: "#d1e3dc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1e3dc",
    borderRadius: 8,
    width: 45,
    height: 60,
    textAlign: "center",
    fontSize: 24,
    color: "#2a5c4a",
    shadowColor: "#d1e3dc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#3a7d5c",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2a5c4a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  resendText: {
    color: "#6b8a7d",
    fontSize: 14,
  },
  resendLink: {
    color: "#3a7d5c",
    fontSize: 14,
    fontWeight: "600",
  },
  passwordHint: {
    color: "#6b8a7d",
    fontSize: 14,
    marginBottom: 20,
    marginTop: -15,
  },
  backButton: {
    alignSelf: "center",
    padding: 12,
  },
  backButtonText: {
    color: "#3a7d5c",
    fontWeight: "600",
    fontSize: 15,
  },
});