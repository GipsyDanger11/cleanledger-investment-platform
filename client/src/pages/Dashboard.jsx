import StatCard from '../components/ui/StatCard';
import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateShort } from '../utils/formatDate';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { investments, notifications, portfolioValue, avgTrustScore, tranchesReleased } = useInvestment();

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="page-header dashboard__header">
        <h1>Investor Dashboard</h1>
        <p>Good morning, {user?.name?.split(' ')[0] || 'Investor'}. Here's your portfolio overview.</p>
        <div className="dashboard__date text-label-sm text-meta">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <section className="dashboard__kpi-grid" aria-label="Key metrics">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(portfolioValue)}
          icon="account_balance_wallet"
          delta="+12.4% this quarter"
          deltaPositive={true}
        />
        <StatCard
          label="Tranches Released"
          value={tranchesReleased}
          icon="payments"
          delta="2 pending DAO vote"
          deltaPositive={false}
        />
        <StatCard
          label="Avg Trust Score"
          value={avgTrustScore}
          suffix="/100"
          icon="shield"
          delta="+3pts from last month"
          deltaPositive={true}
        />
      </section>

      {/* Two-column layout */}
      <div className="dashboard__body">

        {/* Active Investments Table */}
        <section className="card-section dashboard__investments" aria-labelledby="investments-heading">
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 id="investments-heading" className="text-title">Active Investments</h2>
            <span className="chip chip--filter">
              {investments.length} positions
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
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
                {investments.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className="dashboard__inv-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.location.href = `/marketplace/${inv.startupId}`}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="dashboard__inv-avatar">
                          {inv.startupName[0]}
                        </div>
                        <span className="text-body-sm" style={{ fontWeight: 500 }}>
                          {inv.startupName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="chip chip--filter" style={{ fontSize: '0.6rem' }}>{inv.sector}</span>
                    </td>
                    <td className="text-body-sm text-secondary">{inv.trancheStatus}</td>
                    <td className="num text-body-sm" style={{ fontWeight: 600 }}>
                      {formatCurrency(inv.amount)}
                    </td>
                    <td>
                      <TrustScoreBadge score={inv.trustScore} />
                    </td>
                    <td className="num text-label-sm text-meta">{formatDateShort(inv.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notification Log */}
        <section className="card-section dashboard__notifications" aria-labelledby="notif-heading">
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 id="notif-heading" className="text-title">Notification Log</h2>
            <span className="chip chip--success" style={{ fontSize: '0.6rem' }}>
              {notifications.filter(n => !n.read).length} new
            </span>
          </div>
          <div className="dashboard__notif-list">
            {notifications.map((n) => (
              <div key={n.id} className={`dashboard__notif-item ${!n.read ? 'dashboard__notif-item--unread' : ''}`}>
                <div className="dashboard__notif-icon">
                  <span className="material-symbols-outlined">{n.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface)', margin: 0 }}>{n.message}</p>
                  <span className="text-label-sm text-meta">{n.time}</span>
                </div>
                {!n.read && <div className="status-dot status-dot--active" />}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
