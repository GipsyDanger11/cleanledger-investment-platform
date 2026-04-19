import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvestment } from '../context/InvestmentContext';
import { isFounderRole } from '../utils/roles';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function fmt(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const RISK_COLOR = { LOW: '#059669', MEDIUM: '#D97706', HIGH: '#DC2626' };

const NOTIF_ICON_COLOR = {
  vote:     '#6D28D9',
  milestone:'#D97706',
  qa:       '#1D4ED8',
  ledger:   '#065F46',
  kyb:      '#065F46',
  esg:      '#059669',
  announce: '#DC2626',
  profile:  '#4338CA',
  fund:     '#CA8A04',
  default:  '#374151',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    investments, startups, notifications,
    portfolioValue, avgTrustScore, tranchesReleased,
    dashboardData, fetchDashboard, fetchInvestments, loading,
    markNotificationRead, markAllNotificationsRead, unreadCount,
  } = useInvestment();

  const isFounder = isFounderRole(user?.role);

  // Founder's startup comes from dashboardData (API response)
  const myStartup = isFounder
    ? (dashboardData?.startup || null)
    : null;

  const markRead = (id) => markNotificationRead(id);

  useEffect(() => {
    fetchDashboard();
    if (!isFounder) fetchInvestments();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Milestones with pending votes (for investor)
  const votableStartups = startups.filter(s =>
    (s.milestones || []).some(m => m.status === 'submitted')
  );

  return (
    <div className="dashboard2">
      {/* ── Header ── */}
      <div className="d2-header">
        <div className="d2-header__left">
          <p className="d2-greeting">
            {greeting()},{' '}
            <span className="d2-name">{user?.name?.split(' ')[0] || (isFounder ? 'Founder' : 'Investor')} 👋</span>
          </p>
          <p className="d2-date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="d2-header__right">
          <div className={`d2-role-badge d2-role-badge--${isFounder ? 'founder' : 'investor'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {isFounder ? 'business_center' : 'account_balance_wallet'}
            </span>
            {isFounder ? 'Founder View' : 'Investor View'}
          </div>
        </div>
      </div>

      {/* ══ INVESTOR VIEW ══ */}
      {!isFounder && (
        <>
          {/* KPI Strip */}
          <div className="d2-kpi-strip">
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#EEF2FF' }}>
                <span className="material-symbols-outlined" style={{ color: '#4F46E5', fontSize: 22 }}>account_balance_wallet</span>
              </div>
              <div>
                <div className="d2-kpi__value">{fmt(portfolioValue)}</div>
                <div className="d2-kpi__label">Portfolio Value</div>
                <div className="d2-kpi__delta d2-kpi__delta--up">+12.4% this quarter</div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#EDE9FE' }}>
                <span className="material-symbols-outlined" style={{ color: '#7C3AED', fontSize: 22 }}>payments</span>
              </div>
              <div>
                <div className="d2-kpi__value">{tranchesReleased}</div>
                <div className="d2-kpi__label">Tranches Released</div>
                <div className="d2-kpi__delta d2-kpi__delta--warn">2 pending DAO vote</div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#FEF3C7' }}>
                <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: 22 }}>shield</span>
              </div>
              <div>
                <div className="d2-kpi__value">{avgTrustScore}<span style={{ fontSize: 14, fontWeight: 500 }}>/100</span></div>
                <div className="d2-kpi__label">Avg Trust Score</div>
                <div className="d2-kpi__delta d2-kpi__delta--up">+3pts from last month</div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#D1FAE5' }}>
                <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: 22 }}>business</span>
              </div>
              <div>
                <div className="d2-kpi__value">{investments.length}</div>
                <div className="d2-kpi__label">Active Investments</div>
                <div className="d2-kpi__delta d2-kpi__delta--up">All KYB verified</div>
              </div>
            </div>
          </div>

          {/* ── Pending Vote Alert ── */}
          {votableStartups.length > 0 && (
            <div className="d2-vote-alert">
              <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: 20 }}>how_to_vote</span>
              <div style={{ flex: 1 }}>
                <p className="d2-vote-alert__title">Action Required — Open Milestone Votes</p>
                <p className="d2-vote-alert__sub">
                  {votableStartups.map(s => s.name).join(', ')} — voting window is open. Cast your vote to release tranches.
                </p>
              </div>
              <button className="d2-btn d2-btn--warn" onClick={() => navigate('/milestones')}>
                Vote Now
              </button>
            </div>
          )}
          <div className="d2-body">
            {/* Active Investments */}
            <section className="d2-card d2-investments">
              <div className="d2-card__header">
                <h2 className="d2-card__title">Active Investments</h2>
                <span className="d2-pill d2-pill--grey">{investments.length} positions</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="d2-table">
                  <thead>
                    <tr>
                      <th>Startup</th>
                      <th>Sector</th>
                      <th>Tranche Status</th>
                      <th className="num">Invested</th>
                      <th>Trust Score</th>
                      <th className="num">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map(inv => {
                      const startupId = inv.startup?._id || inv.startup;
                      const startup = startups.find(s => s._id === startupId);
                      const riskL = startup?.riskLevel || 'MEDIUM';
                      return (
                        <tr
                          key={inv._id}
                          className="d2-table__row"
                          onClick={() => navigate(`/marketplace/${startupId}`)}
                        >
                          <td>
                            <div className="d2-table__startup">
                              <div className="d2-avatar">{inv.startupName[0]}</div>
                              <span>{inv.startupName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="d2-pill d2-pill--grey" style={{ fontSize: 11 }}>{inv.sector}</span>
                          </td>
                          <td style={{ fontSize: 12, color: '#6B7280' }}>{inv.trancheStatus}</td>
                          <td className="num" style={{ fontWeight: 700, color: '#111' }}>{fmt(inv.amount)}</td>
                          <td>
                            <div className="d2-trust-cell">
                              <span style={{ fontWeight: 800, color: RISK_COLOR[riskL], fontSize: 15 }}>
                                {inv.trustScore}
                              </span>
                              <span className="d2-pill" style={{
                                background: RISK_COLOR[riskL] + '18',
                                color: RISK_COLOR[riskL],
                                fontSize: 10,
                              }}>
                                {riskL}
                              </span>
                            </div>
                          </td>
                          <td className="num" style={{ fontSize: 12, color: '#9CA3AF' }}>{fmtDate(inv.date)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Notifications */}
            <section className="d2-card d2-notifs">
              <div className="d2-card__header">
                <h2 className="d2-card__title">Notification Log</h2>
                <span className="d2-pill d2-pill--indigo">
                  {unreadCount} new
                </span>
              </div>
              <div className="d2-notif-list">
                {notifications.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px', margin: 0 }}>No notifications yet.</p>
                )}
                {notifications.map(n => {
                  const isRead = n.read;
                  const col = NOTIF_ICON_COLOR[n.type] || NOTIF_ICON_COLOR.default;
                  return (
                    <div
                      key={n._id}
                      className={`d2-notif ${!isRead ? 'd2-notif--unread' : ''}`}
                      onClick={() => markRead(n._id)}
                    >
                      <div className="d2-notif__icon" style={{ background: col + '18' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: col }}>
                          {n.type === 'vote_request' ? 'how_to_vote'
                            : n.type === 'fund_release' ? 'account_balance'
                            : n.type === 'announcement' ? 'campaign'
                            : n.type === 'milestone_update' ? 'flag'
                            : n.type === 'qa_answer' ? 'forum'
                            : n.type === 'variance_alert' ? 'warning'
                            : 'notifications'}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="d2-notif__msg" style={{ fontWeight: !isRead ? 700 : 400 }}>{n.title}</p>
                        <p className="d2-notif__msg" style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{n.body}</p>
                        <span className="d2-notif__time">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      {!isRead && <div className="d2-unread-dot" />}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      )}

      {isFounder && myStartup && (
        <>
          {/* Founder KPI Strip */}
          <div className="d2-kpi-strip">
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#EEF2FF' }}>
                <span className="material-symbols-outlined" style={{ color: '#4F46E5', fontSize: 22 }}>savings</span>
              </div>
              <div>
                <div className="d2-kpi__value">{fmt(myStartup.totalRaised)}</div>
                <div className="d2-kpi__label">Total Raised</div>
                <div className="d2-kpi__delta d2-kpi__delta--up">
                  {Math.round((myStartup.totalRaised / myStartup.fundingTarget) * 100)}% of goal
                </div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#FEF3C7' }}>
                <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: 22 }}>shield</span>
              </div>
              <div>
                <div className="d2-kpi__value">{myStartup.trustScore}</div>
                <div className="d2-kpi__label">Trust Score</div>
                <div className="d2-kpi__delta d2-kpi__delta--up">Risk: {myStartup.riskLevel}</div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#D1FAE5' }}>
                <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: 22 }}>person</span>
              </div>
              <div>
                <div className="d2-kpi__value">{myStartup.backers}</div>
                <div className="d2-kpi__label">Backers</div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#EDE9FE' }}>
                <span className="material-symbols-outlined" style={{ color: '#7C3AED', fontSize: 22 }}>task_alt</span>
              </div>
              <div>
                <div className="d2-kpi__value">
                  {myStartup.milestones.filter(m => ['verified','released'].includes(m.status)).length}/{myStartup.milestones.length}
                </div>
                <div className="d2-kpi__label">Milestones Done</div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#FEE2E2' }}>
                <span className="material-symbols-outlined" style={{ color: '#DC2626', fontSize: 22 }}>star_rate</span>
              </div>
              <div>
                <div className="d2-kpi__value">{myStartup.pitchQualityScore}<span style={{ fontSize: 13 }}>/10</span></div>
                <div className="d2-kpi__label">AI Pitch Score</div>
              </div>
            </div>
            <div className="d2-kpi">
              <div className="d2-kpi__icon" style={{ background: '#ECFDF5' }}>
                <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: 22 }}>verified</span>
              </div>
              <div>
                <div className="d2-kpi__value">{myStartup.profileCompletionScore}%</div>
                <div className="d2-kpi__label">Profile Complete</div>
                <div className="d2-kpi__delta d2-kpi__delta--up">{myStartup.verificationBadge}</div>
              </div>
            </div>
          </div>

          {/* Milestone vote status */}
          {myStartup.milestones.some(m => m.status === 'submitted') && (
            <div className="d2-vote-alert">
              <span className="material-symbols-outlined" style={{ color: '#1D4ED8', fontSize: 20 }}>how_to_vote</span>
              <div style={{ flex: 1 }}>
                <p className="d2-vote-alert__title">Investor Voting in Progress</p>
                <p className="d2-vote-alert__sub">
                  Phase 2 (Turbine Procurement) — voting window open. Votes cast so far:
                  {' '}{myStartup.milestones.find(m => m.status === 'submitted')?.votes?.length || 0}
                </p>
              </div>
              <button className="d2-btn d2-btn--blue" onClick={() => navigate('/milestones')}>
                View Votes
              </button>
            </div>
          )}

          <div className="d2-body">
            {/* Milestone overview */}
            <section className="d2-card d2-investments">
              <div className="d2-card__header">
                <h2 className="d2-card__title">Milestone Roadmap — {myStartup.name}</h2>
                <button className="d2-btn d2-btn--outline" onClick={() => navigate('/milestones')}>
                  Full Timeline
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {myStartup.milestones.map((m, i) => {
                  const STATUS_COLORS = {
                    pending:     { bg: '#F3F4F6', color: '#6B7280' },
                    in_progress: { bg: '#FEF3C7', color: '#D97706' },
                    submitted:   { bg: '#DBEAFE', color: '#1D4ED8' },
                    verified:    { bg: '#D1FAE5', color: '#059669' },
                    released:    { bg: '#EDE9FE', color: '#7C3AED' },
                  };
                  const sc = STATUS_COLORS[m.status] || STATUS_COLORS.pending;
                  const votes = m.votes || [];
                  const votePct = votes.length > 0 ? Math.round((votes.filter(v => v.approved).length / votes.length) * 100) : 0;
                  return (
                    <div key={m._id} className="d2-ms-row">
                      <div className="d2-ms-num">{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div className="d2-ms-title">{m.title}</div>
                        <div className="d2-ms-desc">{m.description}</div>
                        {m.status === 'submitted' && (
                          <div className="d2-ms-vote-bar">
                            <div style={{ width: `${votePct}%`, height: '100%', background: votePct >= 60 ? '#10B981' : '#F59E0B', borderRadius: 999 }} />
                          </div>
                        )}
                      </div>
                      <span className="d2-pill" style={{ background: sc.bg, color: sc.color, fontSize: 11 }}>
                        {m.status.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700 }}>{m.tranchePct}%</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Founder Notifications */}
            <section className="d2-card d2-notifs">
              <div className="d2-card__header">
                <h2 className="d2-card__title">Alerts & Updates</h2>
                <span className="d2-pill d2-pill--indigo">{unreadCount} new</span>
              </div>
              <div className="d2-notif-list">
                {notifications.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px', margin: 0 }}>No notifications yet.</p>
                )}
                {notifications.map(n => {
                  const isRead = n.read;
                  const col = NOTIF_ICON_COLOR[n.type] || NOTIF_ICON_COLOR.default;
                  return (
                    <div
                      key={n._id}
                      className={`d2-notif ${!isRead ? 'd2-notif--unread' : ''}`}
                      onClick={() => markRead(n._id)}
                    >
                      <div className="d2-notif__icon" style={{ background: col + '18' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: col }}>
                          {n.type === 'vote_request' ? 'how_to_vote'
                            : n.type === 'fund_release' ? 'account_balance'
                            : n.type === 'announcement' ? 'campaign'
                            : n.type === 'milestone_update' ? 'flag'
                            : n.type === 'qa_answer' ? 'forum'
                            : n.type === 'variance_alert' ? 'warning'
                            : 'notifications'}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="d2-notif__msg" style={{ fontWeight: !isRead ? 700 : 400 }}>{n.title}</p>
                        <p className="d2-notif__msg" style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{n.body}</p>
                        <span className="d2-notif__time">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      {!isRead && <div className="d2-unread-dot" />}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      )}

      {/* ── Quick Nav ── */}
      <div className="d2-quick-nav">
        {[
          { icon: 'storefront',    label: 'Marketplace',       path: '/marketplace' },
          { icon: 'account_tree', label: 'Milestones',         path: '/milestones' },
          { icon: 'savings',      label: 'Fund Dashboard',     path: '/funds' },
          { icon: 'hub',          label: 'Communication Hub',  path: '/communicate' },
          { icon: 'receipt_long', label: 'Audit Trail',        path: '/ledger' },
        ].map(item => (
          <button
            key={item.path}
            className="d2-quick-btn"
            onClick={() => navigate(item.path)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#4F46E5' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
