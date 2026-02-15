// API configuration
// export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // For Android emulator pointing to localhost
export const API_BASE_URL = 'http://3.110.114.250:5000'; // AWS EC2 server
// export const API_BASE_URL = 'http://192.168.0.7:5000'; // Local dev server (your PC's WiFi IP)

// For production, use the server URL
// export const API_BASE_URL = 'https://yourproductionapi.com/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  FARMER_SEND_OTP: '/api/auth/farmer/send-otp',
  FARMER_VERIFY_OTP: '/api/auth/farmer/verify-otp',
  FARMER_REFRESH_TOKEN: '/api/auth/farmer/refresh-token',
};

// Farmer endpoints
export const FARMER_ENDPOINTS = {
  GET_FARMER: (id) => `/farmer/${id}`,
  UPDATE_FARMER: (id) => `/farmer/${id}`,
}; 