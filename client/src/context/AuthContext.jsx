import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Mock user for demo
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

  const isAuthenticated = Boolean(user && token);

  const login = useCallback(async (email, _password) => {
    // Mock login — in real app, POST /api/v1/auth/login
    const mockToken = 'mock_jwt_' + Date.now();
    const loggedInUser = { ...MOCK_USER, email };
    setUser(loggedInUser);
    setToken(mockToken);
    localStorage.setItem('cl_user', JSON.stringify(loggedInUser));
    localStorage.setItem('cl_token', mockToken);
    return loggedInUser;
  }, []);

  const register = useCallback(async (data) => {
    const mockToken = 'mock_jwt_' + Date.now();
    const newUser = { ...MOCK_USER, ...data };
    setUser(newUser);
    setToken(mockToken);
    localStorage.setItem('cl_user', JSON.stringify(newUser));
    localStorage.setItem('cl_token', mockToken);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cl_user');
    localStorage.removeItem('cl_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
