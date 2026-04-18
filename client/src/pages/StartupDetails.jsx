import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MilestoneBar from '../components/ui/MilestoneBar';
import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import { useInvestment } from '../context/InvestmentContext';
import { formatCurrency } from '../utils/formatCurrency';
import './StartupDetails.css';

export default function StartupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startups } = useInvestment();
  const [showDAOModal, setShowDAOModal] = useState(false);
  const [voted, setVoted] = useState(null);

  const startup = startups.find((s) => s.id === id);

  if (!startup) {
    return (
      <div style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
        <p className="text-body-md text-secondary">Startup not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/marketplace')} style={{ marginTop: 'var(--space-4)' }}>
          ← Back to Registry
        </button>
      </div>
    );
  }

  const pct = Math.round((startup.totalRaised / startup.fundingTarget) * 100);
  const hasDAORequired = startup.milestones.some((m) => m.status === 'in_progress' && m.daoVoteRequired);

  const handleVote = (vote) => {
    setVoted(vote);
    setTimeout(() => setShowDAOModal(false), 1500);
  };

  return (
    <div className="startup-details">
      {/* Back */}
      <button className="btn btn-tertiary startup-details__back" onClick={() => navigate('/marketplace')}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        Startup Registry
      </button>

      {/* Hero */}
      <div className="card-section startup-details__hero">
        <div className="startup-details__hero-left">
          <div className="startup-details__avatar">
            {startup.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
              <h1 className="text-headline" style={{ margin: 0 }}>{startup.name}</h1>
              {startup.verificationStatus === 'verified' && (
                <span className="chip chip--success">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified Entity
                </span>
              )}
            </div>
            <p className="text-body-md text-secondary" style={{ margin: 0 }}>
              {startup.sector} · {startup.geography}
            </p>
            <p className="text-body-sm text-secondary" style={{ marginTop: 'var(--space-3)', maxWidth: '60ch' }}>
              {startup.description}
            </p>
          </div>
        </div>
        <div className="startup-details__hero-trust">
          <TrustScoreBadge score={startup.trustScore} />
          <span className="text-label-sm text-meta">Trust Score</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="startup-details__body">

        {/* Left Column */}
        <div className="startup-details__left">

          {/* DAO Alert */}
          {hasDAORequired && (
            <div className="alert-banner alert-banner--warn">
              <span className="material-symbols-outlined" style={{ color: '#F59E0B', flexShrink: 0 }}>how_to_vote</span>
              <div>
                <p className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-on-surface)', margin: 0 }}>
                  Action Required: DAO Consensus Needed
                </p>
                <p className="text-label-sm text-secondary" style={{ margin: '4px 0 0' }}>
                  Milestone 2 requires DAO consensus to release remaining funds.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowDAOModal(true)} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                Vote Now
              </button>
            </div>
          )}

          {/* Milestones */}
          <div className="card">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-6)' }}>Milestone Roadmap</h2>
            <MilestoneBar milestones={startup.milestones} />
          </div>

          {/* Verification Documents */}
          <div className="card">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>Verification Documents</h2>
            <div className="startup-details__docs">
              {startup.kybDocument && (
                <div className="startup-details__doc">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0 }}>{startup.kybDocument}</p>
                      <p className="text-label-sm text-meta" style={{ margin: 0 }}>Know Your Business</p>
                    </div>
                  </div>
                  <span className="chip chip--success" style={{ fontSize: '0.6rem' }}>✓ Verified</span>
                </div>
              )}
              {startup.esgDocument && (
                <div className="startup-details__doc">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>eco</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0 }}>{startup.esgDocument}</p>
                      <p className="text-label-sm text-meta" style={{ margin: 0 }}>Environmental, Social & Governance</p>
                    </div>
                  </div>
                  <span className="chip chip--success" style={{ fontSize: '0.6rem' }}>✓ Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Funding Stats */}
        <div className="startup-details__right">
          <div className="card startup-details__funding-card">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-6)' }}>Funding Overview</h2>

            <div className="startup-details__funding-stats">
              <div className="startup-details__stat">
                <span className="text-label-sm text-meta">Total Raised</span>
                <span className="text-headline tabular" style={{ fontWeight: 700 }}>{formatCurrency(startup.totalRaised)}</span>
              </div>
              <div className="startup-details__stat">
                <span className="text-label-sm text-meta">Target</span>
                <span className="text-title tabular">{formatCurrency(startup.fundingTarget)}</span>
              </div>
              <div className="startup-details__stat">
                <span className="text-label-sm text-meta">Backers</span>
                <span className="text-title tabular">{startup.backers.toLocaleString()}</span>
              </div>
              <div className="startup-details__stat">
                <span className="text-label-sm text-meta">ESG Score</span>
                <span className="text-title tabular" style={{ color: 'var(--color-on-tertiary-container)' }}>{startup.esgScore}/100</span>
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                <span className="text-label-sm text-secondary">Funding Progress</span>
                <span className="text-label-md tabular" style={{ fontWeight: 600 }}>{pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-label-sm text-meta" style={{ marginTop: 'var(--space-2)' }}>
                {formatCurrency(startup.fundingTarget - startup.totalRaised)} remaining
              </p>
            </div>

            {/* Invest CTA */}
            <button
              className="btn btn-primary w-full"
              style={{ marginTop: 'var(--space-6)', justifyContent: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Express Interest
            </button>

            <button className="btn btn-secondary w-full" style={{ marginTop: 'var(--space-3)', justifyContent: 'center' }}>
              Download Prospectus
            </button>
          </div>

          {/* Tags */}
          <div className="card">
            <h3 className="text-label-md text-secondary" style={{ marginBottom: 'var(--space-3)' }}>Tags</h3>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {startup.tags.map((t) => (
                <span key={t} className="chip chip--filter">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DAO Vote Modal */}
      {showDAOModal && (
        <div className="modal-overlay" onClick={() => setShowDAOModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '24px' }}>how_to_vote</span>
              <h2 className="text-title" style={{ margin: 0 }}>DAO Consensus Vote</h2>
            </div>
            <p className="text-body-md text-secondary" style={{ marginBottom: 'var(--space-2)' }}>
              <strong style={{ color: 'var(--color-on-surface)' }}>{startup.name}</strong> — Phase 2: Turbine Procurement
            </p>
            <p className="text-body-sm text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
              Vote to release <strong style={{ color: 'var(--color-on-surface)' }}>{formatCurrency(2100000)}</strong> tranche to the startup upon milestone verification.
              Quorum: 66% of investors must vote to pass.
            </p>

            {voted ? (
              <div className="alert-banner" style={{ justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)' }}>check_circle</span>
                <span className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                  Vote cast: <strong>{voted.toUpperCase()}</strong>
                </span>
              </div>
            ) : (
              <div className="flex gap-3">
                <button className="btn btn-success w-full" style={{ justifyContent: 'center' }} onClick={() => handleVote('yes')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_up</span>
                  Vote Yes
                </button>
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={() => handleVote('no')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_down</span>
                  Vote No
                </button>
                <button className="btn btn-secondary" onClick={() => handleVote('abstain')}>
                  Abstain
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
