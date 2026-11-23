import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// On native mobile devices (Android / iOS), localhost refers to the phone itself,
// so requests to localhost:5000 will net::ERR_CONNECTION_TIMED_OUT.
// We auto-route native devices to the deployed production backend.
const getBaseUrl = () => {
  const isNative = Capacitor.isNativePlatform();
  if (isNative) {
    return import.meta.env.VITE_API_PROD_URL || 'https://pgappbackend.vercel.app/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pg_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('pg_auth_token');
      localStorage.removeItem('pg_user_data');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

