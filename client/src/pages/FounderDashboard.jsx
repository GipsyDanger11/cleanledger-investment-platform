import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import './founder.css';

const FounderDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFounderDashboard = async () => {
      try {
        const { data } = await apiClient.get('/dashboard/founder');
        setDashboard(data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load founder dashboard');
      }
    };
    fetchFounderDashboard();
  }, []);

  const startup = dashboard?.startup || {};
  const milestones = startup?.milestones || [];
  const completedMilestones = milestones.filter((m) => ['verified', 'released'].includes(m.status)).length;
  const revenueEstimate = Math.round((startup.totalRaised || 0) * 0.08);
  const userGrowth = startup.backers ? Math.round(((dashboard?.investorCount || 0) / startup.backers) * 100) : 0;
  const recentActivity = (dashboard?.notifications || []).slice(0, 5);

  const founderStats = [
    { label: 'Revenue (Est. MRR)', value: `$${revenueEstimate.toLocaleString()}` },
    { label: 'User Growth', value: `${Math.min(userGrowth, 100)}%` },
    { label: 'Total Raised', value: `$${(startup.totalRaised || 0).toLocaleString()}` },
    { label: 'Active Investors', value: dashboard?.investorCount || 0 },
    { label: 'Trust Score', value: startup.trustScore || 0 },
    { label: 'Milestones Done', value: `${completedMilestones}/${milestones.length || 0}` },
  ];

  if (error) return <div className="founder-dash founder-dash--error">{error}</div>;
  if (!dashboard) return <div className="founder-dash founder-dash--loading">Loading founder dashboard...</div>;

  return (
    <div className="founder-dash">
      <div className="founder-dash__header">
        <div>
          <h1 className="founder-dash__title">Founder Dashboard</h1>
          <p className="founder-dash__sub">{startup.name} · {startup.sector}</p>
        </div>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <Link to={`/marketplace/${startup._id}`} className="btn btn-outline" style={{display:'flex', alignItems:'center', gap:'4px'}}>
            <span className="material-symbols-outlined" style={{fontSize:'18px'}}>visibility</span> Public Profile
          </Link>
          <Link to="/edit-profile" className="btn btn-secondary" style={{display:'flex', alignItems:'center', gap:'4px'}}>
            <span className="material-symbols-outlined" style={{fontSize:'18px'}}>edit</span> Edit Profile
          </Link>
          <span className="founder-dash__badge">Startup View</span>
        </div>
      </div>

      <div className="founder-dash__stats">
        {founderStats.map((item) => (
          <div className="founder-stat-card" key={item.label}>
            <div className="founder-stat-card__value">{item.value}</div>
            <div className="founder-stat-card__label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="founder-dash__grid">
        <section className="founder-panel">
          <h2>Startup Activity</h2>
          <ul className="founder-activity">
            {recentActivity.length === 0 && <li>No recent activity.</li>}
            {recentActivity.map((n) => (
              <li key={n._id}>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="founder-panel">
          <h2>Milestone Pipeline</h2>
          <ul className="founder-milestones">
            {milestones.map((m) => (
              <li key={m._id}>
                <span>{m.title}</span>
                <span className={`status status--${m.status}`}>{m.status.replace('_', ' ')}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default FounderDashboard;
