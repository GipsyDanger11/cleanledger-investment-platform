import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDenied = () => {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      color: '#e2e8f0',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        backdropFilter: 'blur(12px)'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }}>
          gpp_bad
        </span>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#f87171' }}>Access Denied</h1>
        <p style={{ color: '#cbd5e1', marginBottom: '2rem', lineHeight: '1.6' }}>
          You do not have permission to view this page. This area is restricted based on your account role ({user?.role || 'Guest'}).
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" style={{
            background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
            color: '#fff',
            textDecoration: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'opacity 0.2s'
          }}>
            Return Home
          </Link>
          <Link to="/auth" style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            textDecoration: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}>
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
