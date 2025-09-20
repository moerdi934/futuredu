// lib/api/client.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Environment check
const isBrowser = () => typeof window !== 'undefined';

// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Safe localStorage access
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }
};

// Request interceptor - only add auth token on client side
axiosInstance.interceptors.request.use(
  (config) => {
    // Only add auth token if we're in browser environment
    if (isBrowser()) {
      const token = safeLocalStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - only handle redirects on client side
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only handle auth redirects in browser environment
    if (isBrowser()) {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        safeLocalStorage.removeItem('auth_token');
        // Only redirect if window is available
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else if (error.response?.status === 403) {
        console.warn('Access forbidden');
      } else if (error.response?.status >= 500) {
        console.error('Server error occurred');
      }
    }
    return Promise.reject(error);
  }
);

// Enhanced API Client
export const apiClient = {
  async get(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response: AxiosResponse = await axiosInstance.get(`${API_BASE_URL}${endpoint}`, config);
      return response.data;
    } catch (error) {
      console.error('API GET Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  },

  async post(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response: AxiosResponse = await axiosInstance.post(`${API_BASE_URL}${endpoint}`, data, config);
      return response.data;
    } catch (error) {
      console.error('API POST Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  },

  async put(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response: AxiosResponse = await axiosInstance.put(`${API_BASE_URL}${endpoint}`, data, config);
      return response.data;
    } catch (error) {
      console.error('API PUT Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  },

  async delete(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response: AxiosResponse = await axiosInstance.delete(`${API_BASE_URL}${endpoint}`, config);
      return response.data;
    } catch (error) {
      console.error('API DELETE Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  },

  async patch(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response: AxiosResponse = await axiosInstance.patch(`${API_BASE_URL}${endpoint}`, data, config);
      return response.data;
    } catch (error) {
      console.error('API PATCH Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }
};

// Server-side safe axios instance (no interceptors)
export const serverApiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;