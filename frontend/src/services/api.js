import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
