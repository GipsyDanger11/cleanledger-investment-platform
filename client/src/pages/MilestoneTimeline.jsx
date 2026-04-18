import { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import './MilestoneTimeline.css';

const STARTUP_OPTIONS = [
  { id: 'startup_001', name: 'Aura Wind Energy' },
  { id: 'startup_002', name: 'Solaris Grid Systems' },
  { id: 'startup_003', name: 'HydroClear Technologies' },
  { id: 'startup_004', name: 'Verdant Carbon Labs' },
  { id: 'startup_005', name: 'ThermaVault Energy' },
  { id: 'startup_006', name: 'AquaTrace Monitoring' },
];

const STATUS_META = {
  pending:     { label: 'Pending',     color: '#6B7280', bg: '#F3F4F6', icon: 'schedule' },
  in_progress: { label: 'In Progress', color: '#D97706', bg: '#FEF3C7', icon: 'play_circle' },
  submitted:   { label: 'Submitted',   color: '#1D4ED8', bg: '#DBEAFE', icon: 'how_to_vote' },
  verified:    { label: 'Verified',    color: '#059669', bg: '#D1FAE5', icon: 'verified' },
  released:    { label: 'Released',    color: '#7C3AED', bg: '#EDE9FE', icon: 'payments' },
  missed:      { label: 'Missed',      color: '#DC2626', bg: '#FEE2E2', icon: 'flag' },
};

const R4_SCORE_COLORS = { LOW: '#059669', MEDIUM: '#D97706', HIGH: '#DC2626' };

function getCountdown(deadline) {
  if (!deadline) return null;
  const ms = new Date(deadline) - Date.now();
  if (ms <= 0) return '⏰ Voting closed';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m remaining`;
}

function TrustBreakdown({ startup }) {
  const milestonesDone = (startup.milestones || []).filter(m => ['verified','released'].includes(m.status)).length;
  const milestoneTotal = (startup.milestones || []).length || 1;
  const profileScore   = Math.round((startup.profileCompletionScore / 100) * 25);
  const msScore        = Math.round((milestonesDone / milestoneTotal) * 30);
  const fundScore      = 25;
  const sentimentScore = Math.round((startup.esgScore / 100) * 20);
  const total          = profileScore + msScore + fundScore + sentimentScore;

  return (
    <div className="mt-trust-breakdown">
      <div className="mt-trust-breakdown__header">
        <span className="material-symbols-outlined" style={{ color: '#6366F1', fontSize: 18 }}>shield</span>
        <span>Trust Score Breakdown (R4)</span>
      </div>
      {[
        { label: 'Profile Completeness', score: profileScore, max: 25, icon: 'person' },
        { label: 'Milestone Performance', score: msScore, max: 30, icon: 'flag' },
        { label: 'Fund Usage Accuracy', score: fundScore, max: 25, icon: 'account_balance' },
        { label: 'Investor Sentiment (ESG)', score: sentimentScore, max: 20, icon: 'eco' },
      ].map(item => (
        <div key={item.label} className="mt-trust-breakdown__row">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#6B7280' }}>{item.icon}</span>
          <span className="mt-trust-breakdown__label">{item.label}</span>
          <div className="mt-trust-breakdown__bar-track">
            <div
              className="mt-trust-breakdown__bar-fill"
              style={{ width: `${(item.score / item.max) * 100}%` }}
            />
          </div>
          <span className="mt-trust-breakdown__pts">{item.score}/{item.max}</span>
        </div>
      ))}
      <div className="mt-trust-breakdown__total">
        <span>Total Trust Score</span>
        <span style={{ color: total >= 70 ? '#059669' : total >= 40 ? '#D97706' : '#DC2626', fontWeight: 800, fontSize: 20 }}>
          {total}/100
        </span>
      </div>
    </div>
  );
}

export default function MilestoneTimeline() {
  const { user } = useAuth();
  const { startups, castVote } = useInvestment();
  const [selectedStartupId, setSelectedStartupId] = useState('startup_001');
  const [proofForm, setProofForm]   = useState({ proofUrl: '', proofNote: '' });
  const [activeModal, setActiveModal] = useState(null);
  const [submitting, setSubmitting]  = useState(false);
  const [msg, setMsg]                = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const startup = startups.find(s => s.id === selectedStartupId) || startups[0];
  const milestones = startup?.milestones || [];
  const completedCount = milestones.filter(m => ['verified','released'].includes(m.status)).length;
  const overallPct = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  const releasedPct = milestones
    .filter(m => ['verified','released'].includes(m.status))
    .reduce((s, m) => s + (m.tranchePct || 0), 0);

  const riskLevel = startup?.riskLevel || 'MEDIUM';
  const riskColor = R4_SCORE_COLORS[riskLevel];

  const handleVoteAction = (milestoneId, approved) => {
    setSubmitting(true);
    castVote(selectedStartupId, milestoneId, user?.id || 'inv_001', approved);
    setMsg(`Vote cast — ${approved ? '✓ Approved' : '✗ Rejected'}`);
    setTimeout(() => setMsg(''), 3000);
    setSubmitting(false);
  };

  const handleSubmitProof = (mid) => {
    setSubmitting(true);
    setMsg('Proof submitted! Investors have 48 hours to vote.');
    setActiveModal(null);
    setProofForm({ proofUrl: '', proofNote: '' });
    setTimeout(() => setMsg(''), 3000);
    setSubmitting(false);
  };

  return (
    <div className="milestone-timeline">
      {/* ── Top bar ── */}
      <div className="mt-topbar">
        <div>
          <h1 className="mt-header__title">Milestone Timeline</h1>
          <p className="mt-header__sub">Progress & Investor Voting (R3)</p>
        </div>
        <div className="mt-topbar__right">
          <label className="mt-startup-label">
            Startup
            <select
              className="mt-startup-select"
              value={selectedStartupId}
              onChange={e => setSelectedStartupId(e.target.value)}
            >
              {STARTUP_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="mt-kpi-strip">
        <div className="mt-kpi">
          <div className="mt-kpi__value">{completedCount}/{milestones.length}</div>
          <div className="mt-kpi__label">Milestones Done</div>
        </div>
        <div className="mt-kpi">
          <div className="mt-kpi__value" style={{ color: '#4F46E5' }}>{releasedPct}%</div>
          <div className="mt-kpi__label">Funding Released</div>
        </div>
        <div className="mt-kpi">
          <div className="mt-kpi__value" style={{ color: riskColor }}>{startup?.trustScore || 0}</div>
          <div className="mt-kpi__label">Trust Score</div>
        </div>
        <div className="mt-kpi">
          <div
            className="mt-kpi__value"
            style={{ color: riskColor, fontSize: 16, textTransform: 'uppercase' }}
          >
            {riskLevel} RISK
          </div>
          <div className="mt-kpi__label">Risk Level</div>
        </div>
        <div className="mt-kpi">
          <div className="mt-kpi__value" style={{ color: '#D97706' }}>{startup?.pitchQualityScore || 0}</div>
          <div className="mt-kpi__label">Pitch Score/10</div>
        </div>
        <div className="mt-kpi">
          <div className="mt-kpi__value" style={{ color: '#6366F1' }}>{startup?.credibilityIndex || 0}</div>
          <div className="mt-kpi__label">Credibility Index</div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="mt-progress-card">
        <div className="mt-progress-card__header">
          <span>Overall Progress — {startup?.name}</span>
          <span className="mt-progress-pct">{overallPct.toFixed(0)}%</span>
        </div>
        <div className="mt-progress-track">
          <div className="mt-progress-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="mt-progress-card__footer">
          <span>{completedCount} milestones verified</span>
          <span>{milestones.length - completedCount} remaining</span>
        </div>
      </div>

      {/* ── R4 Trust Score breakdown toggle ── */}
      <button
        className="mt-r4-toggle"
        onClick={() => setShowBreakdown(p => !p)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shield</span>
        {showBreakdown ? 'Hide' : 'Show'} Trust Score Breakdown (R4)
        <span className="material-symbols-outlined" style={{ fontSize: 16, marginLeft: 'auto' }}>
          {showBreakdown ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {showBreakdown && <TrustBreakdown startup={startup} />}

      {/* Flash message */}
      {msg && (
        <div className={`mt-msg ${msg.includes('✓') || msg.includes('!') ? 'mt-msg--success' : 'mt-msg--warn'}`}>
          {msg}
        </div>
      )}

      {/* ── Timeline ── */}
      <div className="mt-timeline">
        {milestones.length === 0 && (
          <div className="mt-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D1D5DB' }}>flag</span>
            <p>No milestones defined yet.</p>
          </div>
        )}

        {milestones.map((m, i) => {
          const meta = STATUS_META[m.status] || STATUS_META.pending;
          const votes = m.votes || [];
          const approvedVotes = votes.filter(v => v.approved).length;
          const votePct = votes.length > 0 ? Math.round((approvedVotes / votes.length) * 100) : 0;
          const countdown = m.status === 'submitted' ? getCountdown(m.voteDeadline) : null;

          return (
            <div key={m.id || i} className={`mt-item ${m.redFlagged ? 'mt-item--flagged' : ''}`}>
              {/* Connector */}
              <div className="mt-connector">
                <div className="mt-connector__dot" style={{ background: meta.color, boxShadow: `0 0 0 4px ${meta.bg}` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>{meta.icon}</span>
                </div>
                {i < milestones.length - 1 && (
                  <div className="mt-connector__line" style={{ background: ['verified','released'].includes(m.status) ? '#D1FAE5' : '#F3F4F6' }} />
                )}
              </div>

              {/* Card */}
              <div className="mt-card">
                <div className="mt-card__top">
                  <div className="mt-card__info">
                    <div className="mt-card__badge-row">
                      <span className="mt-ms-num">MILESTONE {m.phase}</span>
                      <span className="mt-badge" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      {m.redFlagged && <span className="mt-badge mt-badge--red">🚩 Red Flag</span>}
                      {m.tranchePct > 0 && (
                        <span className="mt-badge mt-badge--blue">{m.tranchePct}% tranche</span>
                      )}
                    </div>
                    <h3 className="mt-card__title">{m.title}</h3>
                    {m.description && <p className="mt-card__desc">{m.description}</p>}
                    {m.successCriteria && (
                      <div className="mt-card__criteria">
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#4F46E5' }}>check_box</span>
                        <span style={{ fontSize: 12, color: '#374151' }}>{m.successCriteria}</span>
                      </div>
                    )}
                    {m.targetDate && (
                      <div className="mt-card__date">
                        🎯 Target: {new Date(m.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-card__actions">
                    {/* Submit Proof button (founder) */}
                    {user?.role === 'founder' && ['pending','in_progress'].includes(m.status) && (
                      <button className="mt-btn mt-btn--primary"
                        onClick={() => { setActiveModal({ type: 'submit', mid: m.id }); setMsg(''); }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span>
                        Submit Proof
                      </button>
                    )}

                    {/* Vote panel (investors, submitted milestones) */}
                    {user?.role !== 'founder' && m.status === 'submitted' && (
                      <div className="mt-vote-panel">
                        {countdown && <div className="mt-vote-timer">{countdown}</div>}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="mt-btn mt-btn--approve" onClick={() => handleVoteAction(m.id, true)} disabled={submitting}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_up</span>
                            Approve
                          </button>
                          <button className="mt-btn mt-btn--reject" onClick={() => handleVoteAction(m.id, false)} disabled={submitting}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_down</span>
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {m.proofUrl && (
                      <a href={m.proofUrl} target="_blank" rel="noreferrer" className="mt-btn mt-btn--ghost">
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>open_in_new</span>
                        View Proof
                      </a>
                    )}
                  </div>
                </div>

                {/* Vote progress */}
                {m.status === 'submitted' && votes.length > 0 && (
                  <div className="mt-vote-progress">
                    <div className="mt-vote-progress__header">
                      <span>Investor Votes</span>
                      <span style={{ color: votePct >= 60 ? '#059669' : '#DC2626', fontWeight: 700 }}>
                        {approvedVotes}/{votes.length} approved ({votePct}%)
                        {votePct >= 60 ? ' ✓ Will pass' : ' — Needs 60%'}
                      </span>
                    </div>
                    <div className="mt-vote-track">
                      <div className="mt-vote-fill" style={{
                        width: `${votePct}%`,
                        background: votePct >= 60 ? '#10B981' : '#EF4444',
                      }} />
                    </div>
                    <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                      Threshold: 60% approval required for tranche release
                    </p>
                  </div>
                )}

                {/* Released badge */}
                {['verified','released'].includes(m.status) && m.releasedAt && (
                  <div className="mt-released-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#059669' }}>check_circle</span>
                    {m.tranchePct}% funding tranche released on{' '}
                    {new Date(m.releasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}

                {/* Milestone comments preview */}
                {(m.comments || []).length > 0 && (
                  <div className="mt-comment-preview">
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#9CA3AF' }}>chat_bubble</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {m.comments.length} investor comment{m.comments.length > 1 ? 's' : ''} during voting window
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Submit Proof Modal ── */}
      {activeModal?.type === 'submit' && (
        <div className="mt-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="mt-modal" onClick={e => e.stopPropagation()}>
            <div className="mt-modal__header">
              <h3>Submit Milestone Proof</h3>
              <button className="mt-modal__close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>
              Once submitted, investors have 48 hours to vote. 60%+ approval releases the tranche.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                Proof URL *
              </label>
              <input
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                placeholder="Demo link, GitHub, Google Drive…"
                value={proofForm.proofUrl}
                onChange={e => setProofForm(f => ({ ...f, proofUrl: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Notes</label>
              <textarea
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                rows={3}
                placeholder="Describe what you achieved and how it meets the success criteria…"
                value={proofForm.proofNote}
                onChange={e => setProofForm(f => ({ ...f, proofNote: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#F3F4F6', color: '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
              <button
                style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: '#6366F1', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => handleSubmitProof(activeModal.mid)}
                disabled={submitting || !proofForm.proofUrl.trim()}
              >
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
