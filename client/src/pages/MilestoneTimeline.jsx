import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import './MilestoneTimeline.css';

const STATUS_META = {
  pending:     { label: 'Pending',     color: '#757575', bg: '#F5F5F5', icon: 'schedule' },
  in_progress: { label: 'In Progress', color: '#E65100', bg: '#FFF3E0', icon: 'play_circle' },
  submitted:   { label: 'Submitted',   color: '#1976D2', bg: '#E3F2FD', icon: 'how_to_vote' },
  verified:    { label: 'Verified',    color: '#2E7D32', bg: '#E8F5E9', icon: 'verified' },
  released:    { label: 'Released',    color: '#6A1B9A', bg: '#F3E5F5', icon: 'payments' },
  missed:      { label: 'Missed',      color: '#D32F2F', bg: '#FFEBEE', icon: 'flag' },
};

export default function MilestoneTimeline() {
  const { id: startupIdParam } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null); // { type: 'submit'|'vote', milestoneId }
  const [proofForm, setProofForm] = useState({ proofUrl: '', proofNote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = async (sid) => {
    const res = await apiClient.get(`/startups/${sid}/milestones`);
    setData(res.data.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        let sid = startupIdParam;
        if (!sid) {
          const me = await apiClient.get('/startups/me/profile');
          sid = me.data.data._id;
        }
        await fetchData(sid);
      } catch { setError('No milestone data found. Complete your startup profile first.'); }
      finally { setLoading(false); }
    };
    load();
  }, [startupIdParam]);

  const handleSubmitProof = async (mid) => {
    if (!data) return;
    setSubmitting(true); setMsg('');
    try {
      await apiClient.post(`/startups/${data._id}/milestones/${mid}/submit`, proofForm);
      setMsg('Milestone submitted for investor review!');
      setActiveModal(null);
      setProofForm({ proofUrl: '', proofNote: '' });
      await fetchData(data._id);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to submit.'); }
    finally { setSubmitting(false); }
  };

  const handleVote = async (mid, approved) => {
    if (!data) return;
    setSubmitting(true); setMsg('');
    try {
      await apiClient.post(`/startups/${data._id}/milestones/${mid}/vote`, { approved });
      setMsg(`Vote recorded — ${approved ? 'Approved' : 'Rejected'}`);
      await fetchData(data._id);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to cast vote.'); }
    finally { setSubmitting(false); }
  };

  const getCountdown = (deadline) => {
    if (!deadline) return null;
    const ms = new Date(deadline) - new Date();
    if (ms <= 0) return '⏰ Voting closed';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m remaining`;
  };

  if (loading) return <div className="mt-loading"><span className="material-symbols-outlined fd-spin">refresh</span> Loading...</div>;
  if (error)   return <div className="mt-error">{error}</div>;
  if (!data)   return null;

  const milestones = data.milestones || [];
  const completedCount = milestones.filter(m => ['verified','released'].includes(m.status)).length;
  const overallPct = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  const releasedFunding = milestones
    .filter(m => ['verified','released'].includes(m.status))
    .reduce((s, m) => s + (m.tranchePct || 0), 0);

  return (
    <div className="milestone-timeline">
      {/* ── Header ── */}
      <div className="mt-header">
        <div>
          <h1 className="mt-header__title">Milestone Timeline</h1>
          <p className="mt-header__sub">{data.name} — Progress & Investor Voting (R3)</p>
        </div>
        <div className="mt-header__stats">
          <div className="mt-stat">
            <div className="mt-stat__value">{completedCount}/{milestones.length}</div>
            <div className="mt-stat__label">Milestones Done</div>
          </div>
          <div className="mt-stat">
            <div className="mt-stat__value" style={{color:'#1976D2'}}>{releasedFunding}%</div>
            <div className="mt-stat__label">Funding Released</div>
          </div>
          <div className="mt-stat">
            <div className="mt-stat__value" style={{color: data.trustScore >= 60 ? '#2E7D32' : '#D32F2F'}}>{data.trustScore}</div>
            <div className="mt-stat__label">Trust Score</div>
          </div>
        </div>
      </div>

      {/* ── Overall Progress Bar ── */}
      <div className="mt-progress-card">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
          <span style={{fontSize:'13px', fontWeight:600, color:'#333'}}>Overall Progress</span>
          <span style={{fontSize:'13px', fontWeight:700, color:'#1976D2'}}>{overallPct.toFixed(0)}%</span>
        </div>
        <div className="mt-progress-track">
          <div className="mt-progress-fill" style={{width:`${overallPct}%`}}/>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:'6px'}}>
          <span style={{fontSize:'11px', color:'#9E9E9E'}}>{completedCount} milestones verified</span>
          <span style={{fontSize:'11px', color:'#9E9E9E'}}>{milestones.length - completedCount} remaining</span>
        </div>
      </div>

      {/* ── Status flash messages ── */}
      {msg && (
        <div className="mt-msg" style={{
          background: msg.includes('!') || msg.includes('Approved') ? '#E8F5E9' : '#FFF3E0',
          color: msg.includes('!') || msg.includes('Approved') ? '#2E7D32' : '#E65100',
          border: `1px solid ${msg.includes('!') || msg.includes('Approved') ? '#C8E6C9' : '#FFCC80'}`,
        }}>{msg}</div>
      )}

      {/* ── Timeline ── */}
      <div className="mt-timeline">
        {milestones.length === 0 && (
          <div className="mt-empty">
            <span className="material-symbols-outlined" style={{fontSize:'48px', color:'#BDBDBD'}}>flag</span>
            <p>No milestones defined yet. Edit your startup profile to add milestones.</p>
          </div>
        )}

        {milestones.map((m, i) => {
          const meta = STATUS_META[m.status] || STATUS_META.pending;
          const votes = m.votes || [];
          const approvedVotes = votes.filter(v => v.approved).length;
          const votePct = votes.length > 0 ? (approvedVotes / votes.length) * 100 : 0;
          const countdown = m.status === 'submitted' ? getCountdown(m.voteDeadline) : null;

          return (
            <div key={m._id || i} className={`mt-item ${m.redFlagged ? 'mt-item--flagged' : ''}`}>
              {/* ── Connector line ── */}
              <div className="mt-connector">
                <div className="mt-connector__dot" style={{background: meta.color, boxShadow:`0 0 0 4px ${meta.bg}`}}>
                  <span className="material-symbols-outlined" style={{fontSize:'14px', color:'#FFF'}}>{meta.icon}</span>
                </div>
                {i < milestones.length - 1 && <div className="mt-connector__line"/>}
              </div>

              {/* ── Card ── */}
              <div className="mt-card">
                <div className="mt-card__top">
                  <div className="mt-card__info">
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                      <span style={{fontSize:'11px', fontWeight:700, color:'#9E9E9E'}}>MILESTONE {i + 1}</span>
                      <span className="fund-badge" style={{background:meta.bg, color:meta.color, border:`1px solid ${meta.color}30`}}>
                        {meta.label}
                      </span>
                      {m.redFlagged && (
                        <span className="fund-badge fund-badge--red">🚩 Red Flag</span>
                      )}
                      {m.tranchePct > 0 && (
                        <span className="fund-badge fund-badge--blue">{m.tranchePct}% tranche</span>
                      )}
                    </div>
                    <h3 className="mt-card__title">{m.title}</h3>
                    {m.description && <p className="mt-card__desc">{m.description}</p>}
                    {m.successCriteria && (
                      <div className="mt-card__criteria">
                        <span className="material-symbols-outlined" style={{fontSize:'14px', color:'#1976D2'}}>check_box</span>
                        <span style={{fontSize:'12px', color:'#555'}}>{m.successCriteria}</span>
                      </div>
                    )}
                    {m.targetDate && (
                      <div style={{fontSize:'12px', color:'#9E9E9E', marginTop:'4px'}}>
                        🎯 Target: {new Date(m.targetDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                      </div>
                    )}
                  </div>

                  {/* ── Actions ── */}
                  <div className="mt-card__actions">
                    {['pending','in_progress'].includes(m.status) && (
                      <button className="mt-btn mt-btn--primary" onClick={() => { setActiveModal({type:'submit', mid:m._id||i}); setMsg(''); }}>
                        <span className="material-symbols-outlined" style={{fontSize:'16px'}}>upload</span>
                        Submit Proof
                      </button>
                    )}
                    {m.status === 'submitted' && (
                      <div className="mt-vote-panel">
                        <div className="mt-vote-timer">{countdown}</div>
                        <div style={{display:'flex', gap:'8px'}}>
                          <button className="mt-btn mt-btn--approve" onClick={() => handleVote(m._id || i, true)} disabled={submitting}>
                            ✓ Approve
                          </button>
                          <button className="mt-btn mt-btn--reject" onClick={() => handleVote(m._id || i, false)} disabled={submitting}>
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    )}
                    {m.proofUrl && (
                      <a href={m.proofUrl} target="_blank" rel="noreferrer" className="mt-btn mt-btn--ghost">
                        <span className="material-symbols-outlined" style={{fontSize:'16px'}}>open_in_new</span> View Proof
                      </a>
                    )}
                  </div>
                </div>

                {/* ── Vote Progress (only when submitted) ── */}
                {m.status === 'submitted' && votes.length > 0 && (
                  <div className="mt-vote-progress">
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px', fontSize:'12px'}}>
                      <span style={{color:'#555', fontWeight:600}}>Investor Votes</span>
                      <span style={{color: votePct >= 60 ? '#2E7D32' : '#D32F2F', fontWeight:700}}>
                        {approvedVotes}/{votes.length} approved ({votePct.toFixed(0)}%)
                        {votePct >= 60 ? ' ✓ Will pass' : ' — Needs 60%'}
                      </span>
                    </div>
                    <div className="mt-progress-track" style={{height:'8px'}}>
                      <div style={{
                        width:`${votePct}%`, height:'100%', borderRadius:'999px',
                        background: votePct >= 60 ? '#4CAF50' : '#E57373', transition:'width 0.4s ease'
                      }}/>
                    </div>
                    <div style={{fontSize:'11px', color:'#9E9E9E', marginTop:'4px'}}>
                      Threshold: 60% approval required for tranche release
                    </div>
                  </div>
                )}

                {/* ── Released tranche info ── */}
                {['verified','released'].includes(m.status) && m.releasedAt && (
                  <div style={{display:'flex', alignItems:'center', gap:'6px', padding:'8px 12px', background:'#E8F5E9', borderRadius:'8px', marginTop:'12px'}}>
                    <span className="material-symbols-outlined" style={{fontSize:'16px', color:'#2E7D32'}}>check_circle</span>
                    <span style={{fontSize:'12px', color:'#2E7D32', fontWeight:600}}>
                      {m.tranchePct}% funding tranche released on {new Date(m.releasedAt).toLocaleDateString()}
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
            <p style={{fontSize:'13px', color:'#757575', margin:'0 0 20px'}}>
              Once submitted, investors have 48 hours to vote. 60%+ approval releases the tranche.
            </p>
            <div className="profile-field" style={{marginBottom:'12px'}}>
              <label className="profile-field__label">Proof URL *</label>
              <input className="profile-field__input" placeholder="Demo link, GitHub, Google Drive..."
                value={proofForm.proofUrl} onChange={e => setProofForm(f => ({...f, proofUrl: e.target.value}))}/>
            </div>
            <div className="profile-field" style={{marginBottom:'20px'}}>
              <label className="profile-field__label">Notes</label>
              <textarea className="profile-field__textarea" rows={3}
                placeholder="Describe what you achieved and how it meets the success criteria..."
                value={proofForm.proofNote} onChange={e => setProofForm(f => ({...f, proofNote: e.target.value}))}/>
            </div>
            {msg && <div style={{color:'#D32F2F', fontSize:'13px', marginBottom:'12px'}}>{msg}</div>}
            <div style={{display:'flex', gap:'10px'}}>
              <button className="profile-nav__btn profile-nav__btn--back" onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="profile-nav__btn profile-nav__btn--next"
                onClick={() => handleSubmitProof(activeModal.mid)} disabled={submitting || !proofForm.proofUrl.trim()}>
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
