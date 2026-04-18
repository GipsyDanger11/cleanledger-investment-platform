import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import { useInvestment } from '../context/InvestmentContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateShort } from '../utils/formatDate';
import { useNavigate } from 'react-router-dom';

export default function Portfolio() {
  const { investments } = useInvestment();
  const navigate = useNavigate();
  const totalValue = investments.reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Portfolio</h1>
        <p>Your current investment positions across all CleanLedger-verified startups.</p>
      </div>

      {/* Summary bar */}
      <div className="card-section flex gap-8" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <p className="text-label-sm text-meta">Total Invested</p>
          <p className="text-headline tabular" style={{ fontWeight: 700, margin: 0 }}>{formatCurrency(totalValue)}</p>
        </div>
        <div style={{ borderLeft: '1px solid rgba(197,198,205,0.2)', paddingLeft: 'var(--space-8)' }}>
          <p className="text-label-sm text-meta">Active Positions</p>
          <p className="text-headline tabular" style={{ fontWeight: 700, margin: 0 }}>{investments.length}</p>
        </div>
        <div style={{ borderLeft: '1px solid rgba(197,198,205,0.2)', paddingLeft: 'var(--space-8)' }}>
          <p className="text-label-sm text-meta">Avg. Trust Score</p>
          <p className="text-headline tabular" style={{ fontWeight: 700, margin: 0 }}>
            {Math.round(investments.reduce((s, i) => s + i.trustScore, 0) / investments.length)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Sector</th>
              <th>Tranche Status</th>
              <th className="num">Invested (USD)</th>
              <th>Trust Score</th>
              <th className="num">Entry Date</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv, i) => (
              <tr
                key={inv.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/marketplace/${inv.startupId}`)}
              >
                <td style={{ fontWeight: 500 }}>{inv.startupName}</td>
                <td><span className="chip chip--filter" style={{ fontSize: '0.6rem' }}>{inv.sector}</span></td>
                <td className="text-body-sm text-secondary">{inv.trancheStatus}</td>
                <td className="num text-body-sm" style={{ fontWeight: 600 }}>{formatCurrency(inv.amount)}</td>
                <td><TrustScoreBadge score={inv.trustScore} /></td>
                <td className="num text-label-sm text-meta">{formatDateShort(inv.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
