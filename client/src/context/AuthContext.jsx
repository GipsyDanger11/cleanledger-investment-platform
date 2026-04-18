import { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';

const AuthContext = createContext(null);

// Mock user kept as demo fallback when backend is not available
const MOCK_USER = {
  id: 'usr_001',
  email: 'james.whitfield@capital.com',
  name: 'James Whitfield',
  role: 'investor',
  kycStatus: 'verified',
  entityType: 'individual',
  organization: 'Whitfield Capital Partners',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('cl_user')) || null
  );
  const [token, setToken] = useState(
    () => localStorage.getItem('cl_token') || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(user && token);

  const _persist = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('cl_user', JSON.stringify(userData));
    localStorage.setItem('cl_token', jwt);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      _persist(data.user, data.token);
      return data.user;
    } catch (err) {
      // Fallback to mock for demo when backend is offline
      if (!err.response) {
        const mockToken = 'mock_jwt_' + Date.now();
        const loggedInUser = { ...MOCK_USER, email };
        _persist(loggedInUser, mockToken);
        return loggedInUser;
      }
      const msg = err.response?.data?.message || 'Login failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/register', formData);
      _persist(data.user, data.token);
      return data.user;
    } catch (err) {
      // Fallback to mock for demo when backend is offline
      if (!err.response) {
        const mockToken = 'mock_jwt_' + Date.now();
        const newUser = { ...MOCK_USER, ...formData };
        _persist(newUser, mockToken);
        return newUser;
      }
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore API errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cl_user');
      localStorage.removeItem('cl_token');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, error, login, logout, register, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
