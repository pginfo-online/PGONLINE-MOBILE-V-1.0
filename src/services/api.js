import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'https://pgonline-backend-v-1-0.onrender.com/api/v1' ||  process.env.EXPO_PUBLIC_API_URL || 'https://pgonline-backend-v-1-0.onrender.com/api/v1';


const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('pginfo_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
