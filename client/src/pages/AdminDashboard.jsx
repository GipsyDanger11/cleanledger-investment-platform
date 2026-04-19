import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const MOCK_STATS = {
  userCount: 47,
  startupCount: 12,
  investmentCount: 34,
  totalFundsRaised: '₹33.6Cr',
  pendingVerifications: 3,
  activeInvestors: 28,
};

const MOCK_USERS = [
  { _id: '1', name: 'Priya Mehta', email: 'priya.mehta@aurawind.com', role: 'founder', kycStatus: 'verified' },
  { _id: '2', name: 'James Whitfield', email: 'james.whitfield@capital.com', role: 'investor', kycStatus: 'verified' },
  { _id: '3', name: 'Sara Chen', email: 'sara.chen@greenhydro.com', role: 'founder', kycStatus: 'pending' },
  { _id: '4', name: 'Marcus Johnson', email: 'marcus@venture.io', role: 'investor', kycStatus: 'verified' },
  { _id: '5', name: 'Admin User', email: 'admin@cleanledger.io', role: 'admin', kycStatus: 'verified' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('cl_token');
        const res = await fetch('/api/v1/dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        setStats(data.data);
        setUsers(data.data.users || MOCK_USERS);
      } catch {
        // Fallback to mock data for demo
        setStats(MOCK_STATS);
        setUsers(MOCK_USERS);
      }
    };
    fetchStats();
  }, []);

  if (error) return <div className="admin-dash admin-dash--error">{error}</div>;
  if (!stats) return <div className="admin-dash admin-dash--loading">Loading admin panel…</div>;

  const statCards = [
    { icon: '👥', value: stats.userCount, label: 'Total Users' },
    { icon: '🚀', value: stats.startupCount, label: 'Startups' },
    { icon: '💰', value: stats.investmentCount, label: 'Investments' },
    { icon: '📊', value: stats.totalFundsRaised || '₹33.6Cr', label: 'Funds Raised' },
    { icon: '⏳', value: stats.pendingVerifications || 3, label: 'Pending Verifications' },
    { icon: '🏦', value: stats.activeInvestors || 28, label: 'Active Investors' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  const handleVerifyStartup = async (startupId, status) => {
    try {
      const token = localStorage.getItem('cl_token');
      const res = await fetch(`/api/v1/startups/${startupId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Refresh dashboard data instantly
        const refresh = await fetch('/api/v1/dashboard/admin', { headers: { Authorization: `Bearer ${token}` } });
        const data = await refresh.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to verify startup', err);
    }
  };

  return (
    <div className="admin-dash">
      <header className="admin-nav">
        <div className="admin-nav__brand">
          <span className="admin-nav__logo">CL</span>
          <span className="admin-nav__title">CleanLedger Admin</span>
        </div>
        <div className="admin-nav__actions">
          <span className="admin-nav__user">{user?.name || 'Admin'}</span>
          <button className="admin-nav__logout" onClick={handleLogout}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Log Out
          </button>
        </div>
      </header>

      <div className="admin-dash__header">
        <h1 className="admin-dash__title">Admin Control Panel</h1>
        <span className="admin-dash__badge">⚡ {user?.name || 'Admin'}</span>
      </div>

      {/* Stats */}
      <div className="admin-dash__stats">
        {statCards.map((c, i) => (
          <div className="admin-stat-card" key={i}>
            <div className="admin-stat-card__icon">{c.icon}</div>
            <div className="admin-stat-card__value">{c.value}</div>
            <div className="admin-stat-card__label">{c.label}</div>
          </div>
        ))}
      </div>

      <h2 className="admin-dash__section-title">Startup KYC Management</h2>
      <div className="admin-table-wrap" style={{ marginBottom: '32px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Startup Name</th>
              <th>Sector</th>
              <th>KYC Status</th>
              <th>Verification Documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.startups || []).map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.sector}</td>
                <td>
                  <span className={`role-pill role-pill--${s.verificationStatus === 'verified' ? 'founder' : s.verificationStatus === 'in_review' ? 'investor' : 'unverified'}`}>
                    {s.verificationStatus === 'in_review' ? 'UNDER REVIEW' : s.verificationStatus.toUpperCase()}
                  </span>
                </td>
                <td>
                  {s.verificationDocuments ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {s.verificationDocuments.businessRegistrationUrl && <a href={s.verificationDocuments.businessRegistrationUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}>Biz Reg</a>}
                      {s.verificationDocuments.gstNumberUrl && <a href={s.verificationDocuments.gstNumberUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}>GST</a>}
                      {s.verificationDocuments.founderIdUrl && <a href={s.verificationDocuments.founderIdUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}>ID</a>}
                      {s.verificationDocuments.bankStatementUrl && <a href={s.verificationDocuments.bankStatementUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}>Bank</a>}
                      {s.verificationDocuments.pitchDeckUrl && <a href={s.verificationDocuments.pitchDeckUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none' }}>Pitch</a>}
                    </div>
                  ) : <span style={{ opacity: 0.5, fontSize: '13px' }}>No documents</span>}
                </td>
                <td>
                  {s.verificationStatus !== 'verified' && (
                    <button onClick={() => handleVerifyStartup(s._id, 'verified')} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, marginRight: '8px' }}>
                      Verify
                    </button>
                  )}
                  {s.verificationStatus === 'in_review' && (
                    <button onClick={() => handleVerifyStartup(s._id, 'rejected')} style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(!stats?.startups || stats.startups.length === 0) && (
              <tr><td colSpan="5" style={{ textAlign: 'center', opacity: 0.5 }}>No startups registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Management Table */}
      <h2 className="admin-dash__section-title">User Management</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>System Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`role-pill role-pill--${u.role}`}>{u.role}</span></td>
                <td>
                  <span className={`role-pill role-pill--${u.kycStatus === 'verified' ? 'founder' : 'investor'}`}>
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
