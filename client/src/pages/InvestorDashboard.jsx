import React, { useEffect, useState } from 'react';
import './investor.css';

const InvestorDashboard = () => {
  const [startups, setStartups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/v1/dashboard/investor', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load startups');
        const data = await res.json();
        setStartups(data.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStartups();
  }, []);

  if (error) return <div className="investor-dashboard error">{error}</div>;
  if (!startups.length) return <div className="investor-dashboard loading">Loading...</div>;

  return (
    <div className="investor-dashboard container">
      <h1 className="investor-dashboard title">Marketplace</h1>
      <ul className="startup-list">
        {startups.map((s) => (
          <li key={s._id} className="startup-item">
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <p><strong>Sector:</strong> {s.sector}</p>
            <p><strong>Trust Score:</strong> {s.trustScore}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvestorDashboard;
