import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import './investor.css';

const InvestorDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvestorDashboard = async () => {
      try {
        const { data } = await apiClient.get('/dashboard/investor');
        setDashboard(data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load investor dashboard');
      }
    };
    fetchInvestorDashboard();
  }, []);

  const investments = dashboard?.investments || [];
  const totalInvested = dashboard?.portfolioValue || 0;
  const projectedReturn = Math.round(totalInvested * 1.18);
  const roi = totalInvested > 0 ? Math.round(((projectedReturn - totalInvested) / totalInvested) * 100) : 0;

  const stats = [
    { label: 'Portfolio Value', value: `$${totalInvested.toLocaleString()}` },
    { label: 'Projected Return', value: `$${projectedReturn.toLocaleString()}` },
    { label: 'ROI', value: `${roi}%` },
    { label: 'Avg Trust Score', value: dashboard?.avgTrustScore || 0 },
    { label: 'Active Investments', value: investments.length },
    { label: 'Pending Votes', value: (dashboard?.pendingVotes || []).length },
  ];

  if (error) return <div className="investor-dash investor-dash--error">{error}</div>;
  if (!dashboard) return <div className="investor-dash investor-dash--loading">Loading investor dashboard...</div>;

  return (
    <div className="investor-dash">
      <div className="investor-dash__header">
        <div>
          <h1 className="investor-dash__title">Investor Dashboard</h1>
          <p className="investor-dash__sub">Portfolio overview, ROI, and investment insights</p>
        </div>
        <span className="investor-dash__badge">Investor View</span>
      </div>

      <div className="investor-dash__stats">
        {stats.map((item) => (
          <div className="investor-stat-card" key={item.label}>
            <div className="investor-stat-card__value">{item.value}</div>
            <div className="investor-stat-card__label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="investor-dash__grid">
        <section className="investor-panel">
          <h2>Investment Insights</h2>
          <ul className="investor-list">
            {investments.map((inv) => (
              <li key={inv._id}>
                <strong>{inv.startupName}</strong>
                <span>{inv.sector} · ${inv.amount.toLocaleString()} · Trust {inv.trustScore}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="investor-panel">
          <h2>Action Items</h2>
          <ul className="investor-list">
            {(dashboard.pendingVotes || []).length === 0 && <li>No pending votes.</li>}
            {(dashboard.pendingVotes || []).map((vote) => (
              <li key={vote.milestoneId}>
                <strong>{vote.startupName}</strong>
                <span>{vote.milestoneTitle} · deadline {new Date(vote.voteDeadline).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default InvestorDashboard;
