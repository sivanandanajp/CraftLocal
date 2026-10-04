import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Request Interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    // 1. Try direct token key
    let token = localStorage.getItem('token');

    // 2. Fallback to user object saved in localStorage
    if (!token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          token = parsed?.token;
        } catch (e) {
          console.error('Error parsing stored user:', e);
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

// Response Interceptor for handling global errors (e.g. 401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
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