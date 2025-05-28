import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Slot, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://3.110.114.250:5000';

// Define your app routes
export const ROUTES = {
  ROOT: '/',
  LOGIN: '/Screens/FpoJourney/Login',
  PROFILE: '/Screens/FpoJourney/Profile',
  // Add all other routes your app uses here
} as const;

export type AppRoutes = typeof ROUTES[keyof typeof ROUTES];

// Types
interface FpoUser {
  id: number;
  phone: string;
  fpo_name: string;
  legal_structure?: string;
  state?: string;
  district?: string;
  villages_covered?: string;
  contact_name?: string;
  designation?: string;
  alternate_contact?: string;
  registration_number?: string;
  incorporation_date?: string;
  created_at?: string;
  [key: string]: any;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type AuthState = {
  isAuthenticated: boolean;
  isInitialAuthCheckComplete: boolean;
  isLoading: boolean;
  user: FpoUser | null;
};

interface AuthContextType extends AuthState {
  getAccessToken: () => Promise<string | null>;
  login: (tokens: AuthTokens, userData: FpoUser) => Promise<void>;
  register: (tokens: AuthTokens, userData: FpoUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<FpoUser>) => void;
}

// Context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitialAuthCheckComplete: false,
  isLoading: false,
  user: null,
  getAccessToken: async () => null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isInitialAuthCheckComplete: false,
    isLoading: true,
    user: null,
  });

  const router = useRouter();
  const [isRouterReady, setIsRouterReady] = useState(false);

  // Wait for router to be ready before any navigation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsRouterReady(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const refreshAuthToken = useCallback(async (refreshToken: string) => {
    try {
      console.log('Attempting to refresh token...');
      const response = await axios.post(`${API_URL}/api/auth/fpo/refresh-token`, { 
        refreshToken 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Token refresh successful');
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, []);

  const safeNavigate = useCallback((path: AppRoutes, params?: any) => {
    if (isRouterReady) {
      console.log('Navigating to:', path, params ? 'with params' : '');
      if (params) {
        router.replace({
          pathname: path,
          params
        });
      } else {
        router.replace(path);
      }
    } else {
      console.warn('Router not ready, deferring navigation to:', path);
      setTimeout(() => safeNavigate(path, params), 100);
    }
  }, [isRouterReady, router]);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      await AsyncStorage.multiRemove([
        'accessToken', 
        'refreshToken', 
        'user', 
        'userId', 
        'user_phone'
      ]);
      setState({
        isAuthenticated: false,
        isInitialAuthCheckComplete: true,
        isLoading: false,
        user: null,
      });
      safeNavigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [safeNavigate]);

  const login = useCallback(async (tokens: AuthTokens, userData: FpoUser) => {
    try {
      console.log('Logging in...', userData);
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Immediately store tokens and user data in AsyncStorage
      console.log('Storing authentication tokens and user data...');
      const storageItems: [string, string][] = [
        ['accessToken', tokens.accessToken],
        ['refreshToken', tokens.refreshToken],
        ['user', JSON.stringify(userData)]
      ];
      
      // Store user ID for future reference if available
      if (userData && userData.id) {
        await AsyncStorage.setItem('userId', userData.id.toString());
        console.log('User ID stored:', userData.id);
      }
      
      // Store all authentication data at once
      await AsyncStorage.multiSet(storageItems);
      console.log('Authentication data stored successfully');
      
      // Update state to reflect authenticated status
      setState({
        isAuthenticated: true,
        isInitialAuthCheckComplete: true,
        isLoading: false,
        user: userData,
      });
      
      console.log('Authentication state updated, navigating to profile with ID:', userData?.id);
      
      // Force navigation with params to ensure correct routing
      if (userData?.id) {
        safeNavigate(ROUTES.PROFILE, { fromSignup: true, userId: userData.id.toString() });
      } else {
        safeNavigate(ROUTES.PROFILE);
      }
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [safeNavigate]);

  const updateUser = useCallback((userData: Partial<FpoUser>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...userData };
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { 
        ...prev, 
        user: updatedUser 
      };
    });
  }, []);

  const getAccessToken = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) return accessToken;

      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token available');
        await logout();
        return null;
      }

      console.log('Refreshing access token...');
      const newTokens = await refreshAuthToken(refreshToken);
      await AsyncStorage.multiSet([
        ['accessToken', newTokens.accessToken],
        ['refreshToken', newTokens.refreshToken],
      ]);

      return newTokens.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      await logout();
      return null;
    }
  }, [logout, refreshAuthToken]);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Checking auth status...');
      setState(prev => ({ ...prev, isLoading: true }));
      
      const [accessToken, refreshToken, userData] = await AsyncStorage.multiGet([
        'accessToken', 'refreshToken', 'user'
      ]);

      console.log('Auth status check results:', {
        hasAccessToken: !!accessToken[1],
        hasRefreshToken: !!refreshToken[1],
        hasUserData: !!userData[1]
      });

      // If no tokens at all, we're not authenticated
      if (!accessToken[1] && !refreshToken[1]) {
        console.log('No authentication tokens found');
        return setState({
          isAuthenticated: false,
          isInitialAuthCheckComplete: true,
          isLoading: false,
          user: null,
        });
      }

      const parsedUser = userData[1] ? JSON.parse(userData[1]) : null;

      // First try with the access token if it exists
      if (accessToken[1]) {
        try {
          console.log('Access token exists, proceeding with refresh token check');
          // Don't verify token, just proceed to refresh token check
          return setState({
            isAuthenticated: true,
            isInitialAuthCheckComplete: true,
            isLoading: false,
            user: parsedUser,
          });
        } catch (error) {
          console.log('Error with access token:', error);
          // Don't return here - proceed to try refresh token
        }
      }

      // If we get here, try using the refresh token if it exists
      if (refreshToken[1]) {
        try {
          console.log('Attempting to refresh tokens...');
          const newTokens = await refreshAuthToken(refreshToken[1]);
          
          await AsyncStorage.multiSet([
            ['accessToken', newTokens.accessToken],
            ['refreshToken', newTokens.refreshToken],
          ]);

          console.log('Token refresh successful');
          return setState({
            isAuthenticated: true,
            isInitialAuthCheckComplete: true,
            isLoading: false,
            user: newTokens.user || parsedUser,
          });
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          await logout();
          return;
        }
      }

      // If all else fails, logout
      await logout();
    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    }
  }, [logout, refreshAuthToken]);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthStatus();
    };
    initializeAuth();
  }, [checkAuthStatus]);

  const authContextValue: AuthContextType = {
    ...state,
    getAccessToken,
    login,
    register: login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {state.isInitialAuthCheckComplete ? children : null}
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
      
    </AuthProvider>
  );
}