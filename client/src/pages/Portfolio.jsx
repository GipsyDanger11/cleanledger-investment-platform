import { useEffect } from 'react';
import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import WalletWidget from '../components/ui/WalletWidget';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateShort } from '../utils/formatDate';
import { useNavigate } from 'react-router-dom';

export default function Portfolio() {
  const { investments, fetchInvestments, walletBalance, fetchWallet, loading } = useInvestment();
  const { user } = useAuth();
  const navigate = useNavigate();
  const totalValue = investments.reduce((s, i) => s + i.amount, 0);
  const avgScore = investments.length
    ? Math.round(investments.reduce((s, i) => s + (i.trustScore || 0), 0) / investments.length)
    : 0;

  useEffect(() => {
    fetchInvestments();
    if (user?.role === 'investor') fetchWallet();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Portfolio</h1>
        <p>Your current investment positions across all CleanLedger-verified startups.</p>
      </div>

      {/* Wallet Widget */}
      {user?.role === 'investor' && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <WalletWidget balance={walletBalance} />
        </div>
      )}

      {/* Summary bar */}
      <div className="card-section flex gap-8" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <p className="text-label-sm text-meta">Total Invested</p>
          <p className="text-headline tabular" style={{ fontWeight: 700, margin: 0 }}>
            ₹{totalValue.toLocaleString('en-IN')}
          </p>
        </div>
        <div style={{ borderLeft: '1px solid rgba(197,198,205,0.2)', paddingLeft: 'var(--space-8)' }}>
          <p className="text-label-sm text-meta">Active Positions</p>
          <p className="text-headline tabular" style={{ fontWeight: 700, margin: 0 }}>{investments.length}</p>
        </div>
        <div style={{ borderLeft: '1px solid rgba(197,198,205,0.2)', paddingLeft: 'var(--space-8)' }}>
          <p className="text-label-sm text-meta">Avg. Trust Score</p>
          <p className="text-headline tabular" style={{ fontWeight: 700, margin: 0 }}>
            {avgScore}
          </p>
        </div>
        {walletBalance !== null && user?.role === 'investor' && (
          <div style={{ borderLeft: '1px solid rgba(197,198,205,0.2)', paddingLeft: 'var(--space-8)' }}>
            <p className="text-label-sm text-meta">Remaining Balance</p>
            <p className="text-headline tabular" style={{ fontWeight: 700, margin: 0, color: '#10b981' }}>
              ₹{walletBalance.toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Sector</th>
              <th>Tranche Status</th>
              <th className="num">Invested (₹)</th>
              <th>Trust Score</th>
              <th className="num">Entry Date</th>
              <th className="num" style={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>Block Hash</th>
            </tr>
          </thead>
          <tbody>
            {loading && investments.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>Loading portfolio…</td></tr>
            )}
            {!loading && investments.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>No investments yet. Head to the <span style={{ color: 'var(--color-primary)' }}>Marketplace</span> to invest.</td></tr>
            )}
            {investments.map((inv) => {
              const sid = inv.startup?._id || inv.startup;
              return (
                <tr
                  key={inv._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/marketplace/${sid}`)}
                >
                  <td style={{ fontWeight: 500 }}>{inv.startupName}</td>
                  <td><span className="chip chip--filter" style={{ fontSize: '0.6rem' }}>{inv.sector}</span></td>
                  <td className="text-body-sm text-secondary">{inv.trancheStatus}</td>
                  <td className="num text-body-sm" style={{ fontWeight: 600 }}>
                    ₹{(inv.amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td><TrustScoreBadge score={inv.trustScore} /></td>
                  <td className="num text-label-sm text-meta">{formatDateShort(inv.date)}</td>
                  <td className="num" style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#6B7280', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inv.blockHash ? inv.blockHash.slice(0, 12) + '…' : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
