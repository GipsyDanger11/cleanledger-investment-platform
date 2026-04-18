import React, { useEffect, useState } from 'react';
import './founder.css';

const FounderDashboard = () => {
  const [startup, setStartup] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/v1/dashboard/founder', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load startup data');
        const data = await res.json();
        setStartup(data.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStartup();
  }, []);

  if (error) return <div className="founder-dashboard error">{error}</div>;
  if (!startup) return <div className="founder-dashboard loading">Loading...</div>;

  return (
    <div className="founder-dashboard container">
      <h1 className="founder-dashboard title">Your Startup</h1>
      <h2>{startup.name}</h2>
      <p>{startup.description}</p>
      <p><strong>Trust Score:</strong> {startup.trustScore}</p>
      {/* Add more detailed sections as needed */}
    </div>
  );
};

export default FounderDashboard;
