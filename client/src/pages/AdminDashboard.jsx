import React, { useEffect, useState } from 'react';
import './admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load admin stats');
        const data = await res.json();
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStats();
  }, []);

  if (error) return <div className="admin-dashboard error">{error}</div>;
  if (!stats) return <div className="admin-dashboard loading">Loading...</div>;

  return (
    <div className="admin-dashboard container">
      <h1 className="admin-dashboard title">Admin Dashboard</h1>
      <div className="admin-dashboard stats">
        <div className="card"><strong>Users:</strong> {stats.userCount}</div>
        <div className="card"><strong>Startups:</strong> {stats.startupCount}</div>
        <div className="card"><strong>Investments:</strong> {stats.investmentCount}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
