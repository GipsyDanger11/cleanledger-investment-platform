import { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';

const AuthContext = createContext(null);

// Mock users kept as demo fallback when backend is not available
const MOCK_USER = {
  id: 'usr_001',
  email: 'james.whitfield@capital.com',
  name: 'James Whitfield',
  role: 'investor',
  kycStatus: 'verified',
  entityType: 'individual',
  organization: 'Whitfield Capital Partners',
  profileComplete: true,
  profileCompletionScore: 82,
};

const MOCK_FOUNDER = {
  id: 'usr_002',
  email: 'priya.mehta@aurawind.com',
  name: 'Priya Mehta',
  role: 'founder',
  kycStatus: 'verified',
  entityType: 'company',
  organization: 'Aura Wind Energy',
  profileComplete: true,
  profileCompletionScore: 94,
  startupId: 'startup_001',
};

// Helper: detect if credentials match a known demo account
function pickMockUser(email) {
  const e = (email || '').toLowerCase();
  if (e.includes('founder') || e.includes('startup') || e.includes('priya') || e.includes('aura')) return MOCK_FOUNDER;
  return MOCK_USER;
}

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
        const loggedInUser = { ...pickMockUser(email), email };
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
        const base = pickMockUser(formData.email);
        const newUser = { ...base, ...formData, profileCompletionScore: 20, profileComplete: false };
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

  const updateProfile = useCallback((userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('cl_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, error, login, logout, register, updateProfile, clearError }}
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
