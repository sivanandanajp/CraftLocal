import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Automatically attach JWT Token from LocalStorage to headers
API.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('craftlocal_user');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch (error) {
      console.error('Error parsing token from localStorage:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;