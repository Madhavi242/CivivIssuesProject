import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If in browser on deployed domain (e.g., Vercel), ensure we connect to the deployed Render backend
  if (isBrowser && !isLocalhost) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://civivissuesproject-2.onrender.com/api';
    }
  }

  return envUrl || 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message || error.message;

    if (error.message === 'Network Error') {
      message = 'Cannot connect to backend server. If testing locally, ensure backend is running (`cd backend && npm start`). If on Render, please allow 30s for the free server to wake up.';
    } else if (!message) {
      message = 'An unexpected server communication error occurred.';
    }

    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data,
      message,
    });
  }
);

export default api;
