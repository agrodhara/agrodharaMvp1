import axios from 'axios';
import { useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Define the API URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://3.110.114.250:5000/';
console.log('API service using URL:', API_URL);

// Create a base axios instance for non-authenticated routes
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define public routes that don't need authentication
const publicRoutes = [
  '/api/auth/fpo/send-otp',
  '/api/auth/fpo/verify-otp',
  '/api/auth/fpo/simple-verify-otp',
  '/api/auth/fpo/basic-verify-otp',
  '/api/auth/fpo/direct-register',
  '/api/auth/fpo/check-user-exists',
  '/api/refresh-token',
  '/api/check-user-exists',
  '/api/fpo/login',
  // Add any public farmer routes here if they exist
];

// Define farmer-specific API endpoints
export const farmerApi = {
  createFarmer: (data) => api.post('/api/farmer/', data),
  getFarmers: () => api.get('/api/farmer/'),
  getFarmerById: (id) => api.get(`/api/farmer/${id}`),
  updateFarmer: (id, data) => api.put(`/api/farmer/${id}`, data),
  deleteFarmer: (id) => api.delete(`/api/farmer/${id}`),

  // Add other farmer-related endpoints as needed
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Custom hook for authenticated API access
export const useApi = () => {
  const { getAccessToken, logout, isAuthenticated } = useAuth();
  
  // Create an authenticated axios instance
  const authApi = useMemo(() => {
    console.log('Creating new API instance');
    const instance = axios.create({
      baseURL: API_URL,
      timeout: 15000 // Increase timeout for slower connections
    });
    
    // Add a request interceptor for authentication
    instance.interceptors.request.use(
      async (config) => {
        try {
          // Don't add auth header for public routes
          const isPublicRoute = publicRoutes.some(route => 
            config.url === route || 
            config.url.startsWith(route + '/')
          );
          
          if (!isPublicRoute) {
            console.log(`Adding auth header for: ${config.url}`);
            // Directly get token from storage to avoid circular dependencies
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (accessToken) {
              config.headers['Authorization'] = `Bearer ${accessToken}`;
              console.log('Access token added to request');
            } else {
              console.warn('No access token available for authenticated request');
            }
          } else {
            console.log(`Public route, no auth needed: ${config.url}`);
          }
          
          return config;
        } catch (error) {
          console.error('API request interceptor error:', error);
          return config; // Return config anyway to avoid blocking request
        }
      },
      (error) => {
        console.error('API request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add a response interceptor for error handling
    instance.interceptors.response.use(
      (response) => {
        // Log success but with less detail
        console.log(`API call succeeded: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is not 401 or the request has already been retried, reject
        if (![401, 403].includes(error.response?.status) || originalRequest._retry) {

          return Promise.reject(error);
        }

        if (isRefreshing) {
          console.log('Token refresh already in progress, queuing request');
          // If token refresh is in progress, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            console.log('No refresh token available, redirecting to login');
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'userId']);
            router.replace('/Screens/FpoJourney/Login');
            return Promise.reject(new Error('No refresh token available'));
          }

          console.log('Attempting to refresh token...');
          const response = await axios.post(`${API_URL}api/auth/fpo/refresh-token`, {
            refreshToken
          });

          // Handle different response formats
          let newTokens = response.data;
          if (response.data.data) {
            newTokens = response.data.data;
          }
          
          const accessToken = newTokens.accessToken;
          const newRefreshToken = newTokens.refreshToken;
          
          console.log('Token refresh successful');

          // Update tokens in storage
          await AsyncStorage.multiSet([
            ['accessToken', accessToken],
            ['refreshToken', newRefreshToken]
          ]);
          
          // If user data is available, store it
          if (newTokens.user || newTokens.fpoDetails) {
            const userData = newTokens.user || newTokens.fpoDetails;
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            
            // Store userId for future reference
            if (userData.id) {
              await AsyncStorage.setItem('userId', userData.id.toString());
            }
          }
          
          // Update authorization header
          instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          // Process any queued requests
          processQueue();

          // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          processQueue(refreshError);
          
          // If refresh token is invalid or expired, clear storage and redirect to login
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'userId']);
          router.replace('/Screens/FpoJourney/Login');
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );
    
    return instance;
  }, [getAccessToken, logout, isAuthenticated]);
  
  return authApi;
};

// Create authenticated farmer API methods
export const useFarmerApi = () => {
  const api = useApi();
  
  return {
    createFarmer: (data) => api.post('/api/farmer/', data),
    getFarmers: () => api.get('/api/farmer/'),
    getFarmerById: (id) => api.get(`/api/farmer/${id}`),
    updateFarmer: (id, data) => api.put(`/api/farmer/${id}`, data),
    deleteFarmer: (id) => api.delete(`/api/farmer/${id}`),
    // Add other farmer-related authenticated endpoints as needed
  };
};

export default useApi;