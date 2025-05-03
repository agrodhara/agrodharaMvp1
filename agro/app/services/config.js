// API configuration
// export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // For Android emulator pointing to localhost
export const API_BASE_URL = 'https://agrodhara-18yb.onrender.com'; // For web or iOS simulator

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