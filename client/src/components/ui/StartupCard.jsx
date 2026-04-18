import { useNavigate } from 'react-router-dom';
import TrustScoreBadge from './TrustScoreBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import './StartupCard.css';

export default function StartupCard({ startup }) {
  const navigate = useNavigate();
  const pct = Math.round((startup.totalRaised / startup.fundingTarget) * 100);

  return (
    <article
      className="startup-card"
      onClick={() => navigate(`/marketplace/${startup.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/marketplace/${startup.id}`)}
      aria-label={`View details for ${startup.name}`}
    >
      {/* Header */}
      <div className="startup-card__header">
        <div className="startup-card__avatar">
          {startup.name[0]}
        </div>
        <div className="startup-card__meta">
          <h3 className="startup-card__name text-title">{startup.name}</h3>
          <p className="startup-card__sector text-label-md text-secondary">{startup.sector} · {startup.geography}</p>
        </div>
        {startup.verificationStatus === 'verified' && (
          <span className="chip chip--success startup-card__badge" title="Verified Entity">
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>verified</span>
            KYB
          </span>
        )}
      </div>

      {/* Description */}
      <p className="startup-card__desc text-body-sm text-secondary">{startup.description}</p>

      {/* Funding Progress */}
      <div className="startup-card__funding">
        <div className="flex justify-between" style={{ marginBottom: '6px' }}>
          <span className="text-label-sm text-secondary">Progress</span>
          <span className="text-label-md tabular" style={{ color: 'var(--color-on-surface)' }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between" style={{ marginTop: '6px' }}>
          <span className="text-label-sm tabular text-secondary">{formatCurrency(startup.totalRaised, true)} raised</span>
          <span className="text-label-sm tabular text-meta">of {formatCurrency(startup.fundingTarget, true)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="startup-card__footer">
        <TrustScoreBadge score={startup.trustScore} />
        <span className="text-label-sm text-meta">{startup.backers} backers</span>
        <span className="startup-card__esg text-label-sm">ESG {startup.esgScore}</span>
      </div>

      {/* Tags */}
      <div className="startup-card__tags">
        {startup.tags.map((tag) => (
          <span key={tag} className="chip chip--filter" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
