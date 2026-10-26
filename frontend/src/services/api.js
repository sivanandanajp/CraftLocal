
import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.API_URL || 'https://craftlocal-backend.onrender.com'}/api`,
});

// Attach JWT token to requests
API.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');

    if (!token) {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          token = parsed?.token;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;
