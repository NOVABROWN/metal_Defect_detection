import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Set default headers if token exists
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`);
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const register = async (username, email, password, role) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password,
      role
    });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
