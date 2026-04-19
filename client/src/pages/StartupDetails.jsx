import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MilestoneBar from '../components/ui/MilestoneBar';
import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import WalletWidget from '../components/ui/WalletWidget';
import { useInvestment } from '../context/InvestmentContext';
import { formatCurrency } from '../utils/formatCurrency';
import './StartupDetails.css';

export default function StartupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startups, fetchStartup, walletBalance, invest, fetchWallet, fheAggregate, analyzePitch } = useInvestment();
  const [detail, setDetail] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDAOModal, setShowDAOModal] = useState(false);
  const [voted, setVoted] = useState(null);

  // ── Invest modal state ──────────────────────────────────────
  const [showInvestModal, setShowInvestModal]   = useState(false);
  const [investAmount,    setInvestAmount]       = useState('');
  const [investLoading,   setInvestLoading]      = useState(false);
  const [investError,     setInvestError]        = useState('');
  const [investSuccess,   setInvestSuccess]      = useState(null); // { amount, blockHash, newBalance }

  // ── FHE State ───────────────────────────────────────────────
  const [fheResult, setFheResult] = useState(null);
  const [fheLoading, setFheLoading] = useState(false);

  const handleFHE = async () => {
    setFheLoading(true);
    try {
      const res = await fheAggregate(id);
      setFheResult(res);
    } catch (e) {
      alert('FHE Aggregate failed: ' + e.message);
    } finally {
      setFheLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    (async () => {
      try {
        const full = await fetchStartup(id);
        if (!cancelled) {
          setDetail(full);
          setLoadError(!full);
        }
      } catch {
        if (!cancelled) {
          setDetail(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, fetchStartup]);

  const fromList = startups.find((s) => String(s._id) === String(id));
  const startup = detail || fromList;

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-16)', textAlign: 'center' }} className="text-body-md text-secondary">
        Loading startup…
      </div>
    );
  }

  if (!startup || loadError) {
    return (
      <div style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
        <p className="text-body-md text-secondary">Startup not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/marketplace')} style={{ marginTop: 'var(--space-4)' }}>
          ← Back to Registry
        </button>
      </div>
    );
  }

  const milestones = startup.milestones || [];
  const tags = startup.tags || [];
  const pct = Math.round(((startup.totalRaised || 0) / (startup.fundingTarget || 1)) * 100);
  const hasDAORequired = milestones.some((m) => m.status === 'in_progress' && m.daoVoteRequired);

  const handleVote = (vote) => {
    setVoted(vote);
    setTimeout(() => setShowDAOModal(false), 1500);
  };

  // ── Invest handler ──────────────────────────────────────────
  const handleInvest = async () => {
    setInvestError('');
    const amt = Number(investAmount);
    if (!amt || amt < 1000) {
      setInvestError('Minimum investment is ₹1,000.');
      return;
    }
    if (walletBalance !== null && amt > walletBalance) {
      setInvestError(`Insufficient balance. You have ₹${walletBalance.toLocaleString('en-IN')}.`);
      return;
    }
    setInvestLoading(true);
    try {
      const result = await invest(id, amt, `Round — ${startup.name}`);
      setInvestSuccess({
        amount:     amt,
        blockHash:  result.data?.blockHash || '',
        blockNumber: result.data?.blockNumber,
        newBalance: result.data?.walletBalance,
      });
      setInvestAmount('');
    } catch (e) {
      setInvestError(e.message || 'Investment failed. Please try again.');
    } finally {
      setInvestLoading(false);
    }
  };

  const openInvestModal = () => {
    setInvestSuccess(null);
    setInvestError('');
    setInvestAmount('');
    setShowInvestModal(true);
    // Refresh wallet on open
    fetchWallet();
  };

  const closeInvestModal = () => {
    setShowInvestModal(false);
    setInvestSuccess(null);
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
              {startup.verificationStatus === 'verified' ? (
                <span className="chip chip--success">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                  KYC Verified
                </span>
              ) : startup.verificationStatus === 'in_review' ? (
                <span className="chip" style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>pending_actions</span>
                  Under Review
                </span>
              ) : (
                <span className="chip" style={{ background: '#FEE2E2', color: '#B91C1C', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>
                  Documents Pending
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

          {/* AI Red Flags Warning Badges (Investor Only) */}
          {user?.role === 'investor' && startup.redFlags && startup.redFlags.length > 0 && (
            <div className="alert-banner alert-banner--warn" style={{ marginBottom: 'var(--space-4)', display: 'block', borderLeft: '4px solid #EF4444', backgroundColor: '#FEF2F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-3)' }}>
                <span className="material-symbols-outlined" style={{ color: '#EF4444', fontSize: '24px' }}>warning</span>
                <h3 className="text-title" style={{ margin: 0, color: '#B91C1C' }}>Automatic AI Red Flags</h3>
              </div>
              <ul style={{ paddingLeft: '24px', margin: 0, color: '#991B1B', fontWeight: 500, fontSize: '0.9rem', lineHeight: '1.5' }}>
                {startup.redFlags.map((flag, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

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

          {/* AI Pitch Analysis */}
          {startup.aiAnalysis && startup.aiAnalysis.summary ? (
            <div className="card" style={{ background: 'linear-gradient(to right, var(--color-surface-container), var(--color-surface-container-low))', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '20px' }}>psychology</span>
                <h2 className="text-title" style={{ margin: 0 }}>Mistral AI Pitch Analysis</h2>
                <span className="chip" style={{ marginLeft: 'auto', background: '#F59E0B20', color: '#B45309', fontWeight: 600 }}>
                  Score: {startup.aiAnalysis.score}/100
                </span>
              </div>
              
              <p className="text-body-md text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                {startup.aiAnalysis.summary}
              </p>
              
              <div className="flex" style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <h4 className="text-label-sm" style={{ color: '#10B981', marginBottom: 'var(--space-2)' }}>Key Strengths</h4>
                  <ul className="text-body-sm text-secondary" style={{ paddingLeft: 'var(--space-4)', margin: 0 }}>
                    {startup.aiAnalysis.strengths.map((str, i) => <li key={i}>{str}</li>)}
                    {startup.aiAnalysis.strengths.length === 0 && <li>No specific strengths identified.</li>}
                  </ul>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <h4 className="text-label-sm" style={{ color: '#EF4444', marginBottom: 'var(--space-2)' }}>Risk Flags</h4>
                  <ul className="text-body-sm text-secondary" style={{ paddingLeft: 'var(--space-4)', margin: 0 }}>
                    {startup.aiAnalysis.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)}
                    {startup.aiAnalysis.weaknesses.length === 0 && <li>No specific risk flags identified.</li>}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* Founder Profile */}
          {startup.founderProfile && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>person</span>
                <h2 className="text-title" style={{ margin: 0 }}>Meet the Founder</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h4 className="text-label-sm text-meta">Founder</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div className="startup-details__avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', flexShrink: 0 }}>
                      {startup.createdBy?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-body-md" style={{ fontWeight: 600, color: 'var(--color-on-surface)', margin: 0 }}>
                        {startup.createdBy?.name || 'Anonymous'}
                      </p>
                      <p className="text-body-sm text-secondary" style={{ margin: 0 }}>{startup.founderProfile.founderTitle}</p>
                    </div>
                  </div>
                </div>
                {startup.founderProfile.founderLinkedIn && (
                  <div>
                    <h4 className="text-label-sm text-meta">LinkedIn</h4>
                    <a href={startup.founderProfile.founderLinkedIn} target="_blank" rel="noopener noreferrer" className="text-body-sm" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', margin: '8px 0 0' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>link</span>
                      View Profile
                    </a>
                  </div>
                )}
              </div>

              {startup.founderProfile.founderMissionStatement && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <h4 className="text-label-sm text-meta">Mission Statement</h4>
                  <p className="text-body-sm text-secondary" style={{ margin: '8px 0 0', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid var(--color-primary-container)', paddingLeft: '16px' }}>
                    "{startup.founderProfile.founderMissionStatement}"
                  </p>
                </div>
              )}

              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--space-4)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {startup.founderProfile.leadershipExperienceYears !== undefined && startup.founderProfile.leadershipExperienceYears !== null && (
                  <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
                    <span className="text-body-sm text-secondary">Leadership Experience</span>
                    <span className="text-label-md" style={{ fontWeight: 700 }}>{startup.founderProfile.leadershipExperienceYears} Years</span>
                  </div>
                )}
                {startup.founderProfile.operatorBackground && (
                  <div style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
                    <span className="text-body-sm text-secondary" style={{ display: 'block', marginBottom: '4px' }}>Operator Background</span>
                    <p className="text-label-sm" style={{ margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{startup.founderProfile.operatorBackground}</p>
                  </div>
                )}
                {startup.founderProfile.priorExitsOrAdvisory && (
                  <div style={{ paddingTop: '4px' }}>
                    <span className="text-body-sm text-secondary" style={{ display: 'block', marginBottom: '4px' }}>Prior Exits & Advisory</span>
                    <p className="text-label-sm" style={{ margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{startup.founderProfile.priorExitsOrAdvisory}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div className="card">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-6)' }}>Milestone Roadmap</h2>
            <MilestoneBar milestones={milestones} />
          </div>

          {/* Verification Documents */}
          <div className="card">
            <h2 className="text-title" style={{ marginBottom: 'var(--space-4)' }}>Verification Documents</h2>
            <div className="startup-details__docs">
              {startup.verificationDocuments?.businessRegistrationUrl && (
                <div className="startup-details__doc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', marginBottom: '8px' }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0 }}>Business Registration Certificate</p>
                      <p className="text-label-sm text-secondary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span> Securely held in vault</p>
                    </div>
                  </div>
                  <span className={`chip ${startup.verificationStatus === 'verified' ? 'chip--success' : ''}`} style={{ fontSize: '0.6rem', background: startup.verificationStatus !== 'verified' ? '#FEF3C7' : undefined, color: startup.verificationStatus !== 'verified' ? '#B45309' : undefined }}>
                    {startup.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Review'}
                  </span>
                </div>
              )}
              {startup.verificationDocuments?.gstNumberUrl && (
                <div className="startup-details__doc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', marginBottom: '8px' }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0 }}>GST Number</p>
                      <p className="text-label-sm text-secondary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span> Securely held in vault</p>
                    </div>
                  </div>
                  <span className={`chip ${startup.verificationStatus === 'verified' ? 'chip--success' : ''}`} style={{ fontSize: '0.6rem', background: startup.verificationStatus !== 'verified' ? '#FEF3C7' : undefined, color: startup.verificationStatus !== 'verified' ? '#B45309' : undefined }}>
                    {startup.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Review'}
                  </span>
                </div>
              )}
              {startup.verificationDocuments?.founderIdUrl && (
                <div className="startup-details__doc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', marginBottom: '8px' }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>badge</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0 }}>Founder Aadhaar / PAN</p>
                      <p className="text-label-sm text-secondary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span> Securely held in vault</p>
                    </div>
                  </div>
                  <span className={`chip ${startup.verificationStatus === 'verified' ? 'chip--success' : ''}`} style={{ fontSize: '0.6rem', background: startup.verificationStatus !== 'verified' ? '#FEF3C7' : undefined, color: startup.verificationStatus !== 'verified' ? '#B45309' : undefined }}>
                    {startup.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Review'}
                  </span>
                </div>
              )}
              {startup.verificationDocuments?.pitchDeckUrl && (
                <div className="startup-details__doc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', marginBottom: '8px' }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>presentation</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0 }}>Pitch Deck</p>
                      <p className="text-label-sm text-secondary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span> Securely held in vault</p>
                    </div>
                  </div>
                  <span className={`chip ${startup.verificationStatus === 'verified' ? 'chip--success' : ''}`} style={{ fontSize: '0.6rem', background: startup.verificationStatus !== 'verified' ? '#FEF3C7' : undefined, color: startup.verificationStatus !== 'verified' ? '#B45309' : undefined }}>
                    {startup.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Review'}
                  </span>
                </div>
              )}
              {startup.verificationDocuments?.bankStatementUrl && (
                <div className="startup-details__doc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', marginBottom: '8px' }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0 }}>Bank Statement</p>
                      <p className="text-label-sm text-secondary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span> Securely held in vault</p>
                    </div>
                  </div>
                  <span className={`chip ${startup.verificationStatus === 'verified' ? 'chip--success' : ''}`} style={{ fontSize: '0.6rem', background: startup.verificationStatus !== 'verified' ? '#FEF3C7' : undefined, color: startup.verificationStatus !== 'verified' ? '#B45309' : undefined }}>
                    {startup.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Review'}
                  </span>
                </div>
              )}
              {(!startup.verificationDocuments || Object.keys(startup.verificationDocuments).length === 0) && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }}>folder_off</span>
                  <p className="text-body-sm" style={{ margin: 0 }}>{startup.verificationStatus === 'verified' ? 'Documents protected & verified.' : 'No verification documents uploaded yet.'}</p>
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
                <span className="text-title tabular">{(startup.backers ?? 0).toLocaleString()}</span>
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
                {formatCurrency((startup.fundingTarget || 0) - (startup.totalRaised || 0))} remaining
              </p>
            </div>

            {/* Invest CTA — only for investors */}
            {user?.role === 'investor' && (
              <>
                {/* Wallet balance preview */}
                {walletBalance !== null && (
                  <WalletWidget balance={walletBalance} compact />
                )}
                <button
                  id="btn-invest-now"
                  className="btn btn-primary w-full"
                  style={{ marginTop: 'var(--space-4)', justifyContent: 'center' }}
                  onClick={openInvestModal}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance_wallet</span>
                  Invest Now
                </button>
              </>
            )}

            <button className="btn btn-secondary w-full" style={{ marginTop: 'var(--space-3)', justifyContent: 'center' }}>
              Download Prospectus
            </button>
          </div>

          {/* FHE Demo Panel */}
          <div className="card startup-details__fhe-card" style={{ marginTop: 'var(--space-4)', background: 'var(--color-surface-container)' }}>
            <h3 className="text-label-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 var(--space-4)' }}>
              <span className="material-symbols-outlined" style={{ color: '#7c3aed', fontVariationSettings: "'FILL' 1" }}>lock_person</span>
              FHE Identity Protection
            </h3>
            <p className="text-body-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              Investor identities and amounts are encrypted via <strong>Paillier Additive Homomorphic Encryption</strong>. The platform calculates total funds raised without decrypting individual portfolios.
            </p>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', borderColor: 'rgba(124,58,237,0.3)', color: '#7c3aed' }}
              onClick={handleFHE}
              disabled={fheLoading}
            >
              {fheLoading ? 'Computing Ciphertexts…' : 'Run FHE Homomorphic Sum'}
            </button>
            
            {fheResult && (
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-surface-container-low)', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }}>
                <p className="text-label-sm" style={{ margin: '0 0 var(--space-2)' }}>
                  <strong>{fheResult.investorCount} Encrypted Inputs:</strong>
                </p>
                <div style={{ maxHeight: '80px', overflowY: 'auto', marginBottom: 'var(--space-2)', fontSize: '0.65rem', fontFamily: 'Courier New, monospace', color: 'var(--color-outline)' }}>
                  {fheResult.encryptedCiphertexts?.map((c, i) => (
                    <div key={i}>ID:{c.investorIdHash.slice(0,6)}... E(x): {c.ciphertext}</div>
                  ))}
                  {fheResult.investorCount === 0 && 'No investments yet.'}
                </div>
                {fheResult.investorCount > 0 && (
                  <>
                    <p className="text-label-sm" style={{ margin: 'var(--space-3) 0 var(--space-1)' }}>
                      <strong>Homomorphic Sum Ciphertext:</strong>
                    </p>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'Courier New, monospace', color: '#7c3aed', background: 'rgba(124,58,237,0.1)', padding: '4px', borderRadius: '4px', wordBreak: 'break-all' }}>
                      {fheResult.fheSum}
                    </div>
                    <p className="text-label-sm" style={{ margin: 'var(--space-3) 0 4px', color: '#10b981', fontWeight: 600 }}>
                      ✅ Decrypted Aggregate Verification:
                    </p>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'Courier New, monospace', color: '#10b981' }}>
                      {fheResult.verification}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="card">
            <h3 className="text-label-md text-secondary" style={{ marginBottom: 'var(--space-3)' }}>Tags</h3>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {tags.map((t) => (
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

      {/* ── Invest Modal ─────────────────────────────────────────── */}
      {showInvestModal && (
        <div className="modal-overlay" onClick={closeInvestModal}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-5)' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              <h2 className="text-title" style={{ margin: 0 }}>Invest in {startup.name}</h2>
            </div>

            {investSuccess ? (
              /* ── Success screen ── */
              <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>✅</div>
                <h3 className="text-title" style={{ color: '#10b981', marginBottom: 'var(--space-2)' }}>
                  Investment Confirmed!
                </h3>
                <p className="text-body-md text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                  <strong style={{ color: 'var(--color-on-surface)' }}>₹{investSuccess.amount.toLocaleString('en-IN')}</strong> invested in {startup.name}
                </p>

                {/* Blockchain receipt */}
                <div style={{
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'left',
                  marginBottom: 'var(--space-4)',
                }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10b981', margin: '0 0 8px' }}>⛓ Blockchain Receipt</p>
                  {investSuccess.blockNumber !== undefined && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-meta, #9CA3AF)', margin: '0 0 4px' }}>
                      Block #{investSuccess.blockNumber}
                    </p>
                  )}
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-text-meta, #9CA3AF)', wordBreak: 'break-all', margin: 0, fontFamily: 'monospace' }}>
                    {investSuccess.blockHash || 'hash unavailable'}
                  </p>
                </div>

                <div className="flex items-center gap-2" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-meta, #9CA3AF)' }}>New balance:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>₹{(investSuccess.newBalance ?? walletBalance)?.toLocaleString('en-IN')}</span>
                </div>

                <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={closeInvestModal}>
                  Done
                </button>
              </div>
            ) : (
              /* ── Input screen ── */
              <>
                {/* Wallet balance */}
                <WalletWidget balance={walletBalance} />

                {/* Amount input */}
                <div style={{ marginTop: 'var(--space-5)' }}>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', color: 'var(--color-on-surface)' }}>
                    Investment Amount (₹)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-meta, #9CA3AF)', fontSize: '1rem', fontWeight: 600,
                    }}>₹</span>
                    <input
                      id="invest-amount-input"
                      type="number"
                      min="1000"
                      max={walletBalance ?? 100000}
                      step="1000"
                      placeholder="e.g. 10000"
                      value={investAmount}
                      onChange={e => setInvestAmount(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px 12px 32px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${investError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: '8px', color: 'var(--color-on-surface, #E8EAED)',
                        fontSize: '1.05rem', fontWeight: 600, outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleInvest()}
                    />
                  </div>
                  {/* Quick amount chips */}
                  <div className="flex gap-2" style={{ marginTop: '8px', flexWrap: 'wrap' }}>
                    {[5000, 10000, 25000, 50000].map(q => (
                      <button
                        key={q}
                        className="chip chip--filter"
                        style={{ cursor: 'pointer', fontSize: '0.65rem' }}
                        onClick={() => setInvestAmount(String(q))}
                      >
                        ₹{q.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  {investError && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '8px', margin: '8px 0 0' }}>
                      {investError}
                    </p>
                  )}
                </div>

                {/* Info blurb */}
                <p className="text-label-sm text-meta" style={{ marginTop: 'var(--space-3)' }}>
                  This is a virtual investment using demo funds. No real money is involved. The transaction will be recorded on-chain.
                </p>

                {/* Actions */}
                <div className="flex gap-3" style={{ marginTop: 'var(--space-5)' }}>
                  <button
                    id="btn-confirm-invest"
                    className="btn btn-primary w-full"
                    style={{ justifyContent: 'center' }}
                    onClick={handleInvest}
                    disabled={investLoading}
                  >
                    {investLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                        Processing…
                      </span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                        Confirm Investment
                      </>
                    )}
                  </button>
                  <button className="btn btn-secondary" onClick={closeInvestModal} disabled={investLoading}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
