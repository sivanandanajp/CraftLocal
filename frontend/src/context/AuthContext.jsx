import React, { createContext, useState } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser || savedUser === 'undefined' || savedUser === 'null') {
        return null;
      }
      return JSON.parse(savedUser);
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveUserData = (token, userData) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (userData && typeof userData === 'object') {
      const { token: _, ...cleanUser } = userData;
      localStorage.setItem('user', JSON.stringify(cleanUser));
      setUser(cleanUser);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...userData,
        email: userData.email.trim().toLowerCase(),
      };

      const res = await API.post('/auth/register', payload);

      const token = res.data?.token || res.data?.accessToken;
      const loggedUser = res.data?.user || res.data;

      if (!token || !loggedUser) {
        throw new Error('Invalid registration response from server');
      }

      saveUserData(token, loggedUser);
      return loggedUser;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.message.includes('Network Error')
          ? 'Cannot connect to backend server. Ensure backend is running.'
          : 'Registration failed');

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...credentials,
        email: credentials.email.trim().toLowerCase(),
      };

      const res = await API.post('/auth/login', payload);

      const token = res.data?.token || res.data?.accessToken;
      const loggedUser = res.data?.user || res.data;

      if (!token || !loggedUser) {
        throw new Error('Invalid response from server. Missing user or token.');
      }

      saveUserData(token, loggedUser);
      return loggedUser;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Dedicated function for full profile updates (PUT /auth/profile)
  const updateUserProfile = async (profileData) => {
    try {
      const res = await API.put('/auth/profile', profileData);
      const updatedUser = { ...user, ...(res.data?.user || res.data) };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      throw err;
    }
  };

  const updateUserRole = async (newRole) => {
    try {
      const res = await API.patch('/users/role', { role: newRole });
      const updatedUser = res.data?.user || res.data;

      if (updatedUser && typeof updatedUser === 'object') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update role';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        setError,
        register,
        login,
        logout,
        updateUserProfile,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};