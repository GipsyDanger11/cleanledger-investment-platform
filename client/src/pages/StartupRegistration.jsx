import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './StartupRegistration.css';

const STEPS = [
  { id: 1, title: 'Business Details',        icon: 'business' },
  { id: 2, title: 'Team Members',            icon: 'group' },
  { id: 3, title: 'Documents & Pitch',       icon: 'description' },
  { id: 4, title: 'Funding & Milestones',    icon: 'flag' },
];

const SECTORS = [
  'Clean Energy','Solar Tech','Wind Energy','Water Tech',
  'Carbon Markets','Environmental IoT','Thermal Storage',
  'Green Hydrogen','Sustainable Agriculture','Other',
];

function calcScore(form) {
  let s = 0;
  if (form.name)               s += 20;
  if (form.category)           s += 15;
  if (form.incorporationProof) s += 20;
  if (form.teamMembers.filter(t => t.name).length) s += 15;
  if (form.pitchText || form.pitchDeck) s += 10;
  if (form.fundingGoal)        s += 10;
  if (form.milestones.filter(m => m.title).length) s += 10;
  return Math.min(s, 100);
}

const STATUS_META = {
  unverified: { label: 'Unverified',      color: '#6B7280', bg: '#F3F4F6',  icon: 'pending' },
  pending:    { label: 'Pending Review',   color: '#D97706', bg: '#FEF3C7',  icon: 'schedule' },
  verified:   { label: 'KYB Verified',    color: '#059669', bg: '#D1FAE5',  icon: 'verified' },
};

export default function StartupRegistration() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [profileScore, setProfileScore] = useState(0);

  const [form, setForm] = useState({
    // Account
    name: '', email: '', password: '', confirmPassword: '',
    // Business
    companyName: '', category: '', incorporationProof: null,
    registrationNumber: '', website: '',
    // Team
    teamMembers: [
      { name: '', role: '', linkedIn: '' },
      { name: '', role: '', linkedIn: '' },
    ],
    // Docs
    pitchDeck: null, pitchText: '', businessPlan: null,
    // Funding
    fundingGoal: '', timeline: '',
    milestones: [
      { title: '', targetDate: '', tranchePct: '' },
      { title: '', targetDate: '', tranchePct: '' },
    ],
  });

  useEffect(() => { setProfileScore(calcScore(form)); }, [form]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateTeam = (i, k, v) => setForm(f => {
    const t = [...f.teamMembers];
    t[i] = { ...t[i], [k]: v };
    return { ...f, teamMembers: t };
  });
  const updateMs = (i, k, v) => setForm(f => {
    const m = [...f.milestones];
    m[i] = { ...m[i], [k]: v };
    return { ...f, milestones: m };
  });
  const addTeam = () => setForm(f => ({ ...f, teamMembers: [...f.teamMembers, { name: '', role: '', linkedIn: '' }] }));
  const addMs   = () => setForm(f => ({ ...f, milestones: [...f.milestones, { title: '', targetDate: '', tranchePct: '' }] }));

  const handleSubmit = async () => {
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('cl_token') || localStorage.getItem('token');
      const payload = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          if (val instanceof File) payload.append(key, val);
          else if (Array.isArray(val)) payload.append(key, JSON.stringify(val));
          else payload.append(key, val);
        }
      });

      // Backend register the user first, then submit startup
      await register({ name: form.name, email: form.email, password: form.password, role: 'startup', organization: form.companyName });
      setVerificationStatus('pending');
      navigate('/profile-setup');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = STATUS_META[verificationStatus];
  const canNext1 = form.name && form.email && form.password && form.companyName && form.category;
  const canNext3 = form.pitchText || form.pitchDeck;

  return (
    <div className="sr-page">
      <div className="sr-bg-grid" />

      <Link to="/auth" className="sr-back">
        <span className="material-symbols-outlined">arrow_back</span> Back
      </Link>

      <div className="sr-container">
        {/* Header */}
        <div className="sr-header">
          <div className="sr-header__badge">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h1 className="sr-header__title">Startup Registration Wizard</h1>
          <p className="sr-header__sub">Create your verified TrustBridge profile (R1)</p>
        </div>

        {/* Profile score + verification */}
        <div className="sr-meta-strip">
          <div className="sr-score-wrap">
            <div className="sr-score-bar-track">
              <div className="sr-score-bar-fill" style={{ width: `${profileScore}%` }} />
            </div>
            <span className="sr-score-label">Profile Completeness: <strong>{profileScore}%</strong></span>
          </div>
          <div className="sr-status-badge" style={{ background: statusMeta.bg, color: statusMeta.color }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{statusMeta.icon}</span>
            {statusMeta.label}
          </div>
        </div>

        {/* Step indicators */}
        <div className="sr-steps">
          {STEPS.map((s) => (
            <div key={s.id} className={`sr-step ${step === s.id ? 'sr-step--active' : ''} ${step > s.id ? 'sr-step--done' : ''}`}>
              <div className="sr-step__dot">
                {step > s.id
                  ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                  : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{s.icon}</span>
                }
              </div>
              <span className="sr-step__label">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="sr-card">
          {error && <div className="sr-error"><span className="material-symbols-outlined">error</span> {error}</div>}

          {/* ── Step 1: Business Details ── */}
          {step === 1 && (
            <div className="sr-fields">
              <h3 className="sr-section-title">Account & Business Information</h3>
              <div className="sr-row">
                <div className="sr-field">
                  <label>Your Full Name *</label>
                  <input className="sr-input" placeholder="Priya Mehta"
                    value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="sr-field">
                  <label>Email Address *</label>
                  <input className="sr-input" type="email" placeholder="you@startup.com"
                    value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
              </div>
              <div className="sr-row">
                <div className="sr-field">
                  <label>Password *</label>
                  <input className="sr-input" type="password" placeholder="Min. 8 characters"
                    value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
                <div className="sr-field">
                  <label>Confirm Password *</label>
                  <input className="sr-input" type="password" placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                </div>
              </div>
              <div className="sr-divider">Business Information</div>
              <div className="sr-row">
                <div className="sr-field">
                  <label>Company Name *</label>
                  <input className="sr-input" placeholder="Aura Wind Energy Pvt. Ltd."
                    value={form.companyName} onChange={e => update('companyName', e.target.value)} />
                </div>
                <div className="sr-field">
                  <label>Sector / Category *</label>
                  <select className="sr-input" value={form.category} onChange={e => update('category', e.target.value)}>
                    <option value="">Select sector…</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="sr-row">
                <div className="sr-field">
                  <label>Registration Number</label>
                  <input className="sr-input" placeholder="CIN / Company ID"
                    value={form.registrationNumber} onChange={e => update('registrationNumber', e.target.value)} />
                </div>
                <div className="sr-field">
                  <label>Website</label>
                  <input className="sr-input" placeholder="https://yoursite.com"
                    value={form.website} onChange={e => update('website', e.target.value)} />
                </div>
              </div>
              <div className="sr-field">
                <label>Incorporation Proof (PDF)</label>
                <input className="sr-input sr-file-input" type="file" accept="application/pdf"
                  onChange={e => update('incorporationProof', e.target.files[0])} />
                <p className="sr-hint">Certificate of incorporation, MoA, or equivalent regulatory filing</p>
              </div>
            </div>
          )}

          {/* ── Step 2: Team Members ── */}
          {step === 2 && (
            <div className="sr-fields">
              <h3 className="sr-section-title">Team Members</h3>
              <p className="sr-hint" style={{ marginTop: -4 }}>Add key team members with LinkedIn for identity verification</p>
              {form.teamMembers.map((tm, i) => (
                <div key={i} className="sr-team-member">
                  <div className="sr-team-member__num">{i + 1}</div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div className="sr-field">
                      <label>Name</label>
                      <input className="sr-input" placeholder="John Doe"
                        value={tm.name} onChange={e => updateTeam(i, 'name', e.target.value)} />
                    </div>
                    <div className="sr-field">
                      <label>Role / Title</label>
                      <input className="sr-input" placeholder="CEO"
                        value={tm.role} onChange={e => updateTeam(i, 'role', e.target.value)} />
                    </div>
                    <div className="sr-field">
                      <label>LinkedIn URL</label>
                      <input className="sr-input" placeholder="linkedin.com/in/…"
                        value={tm.linkedIn} onChange={e => updateTeam(i, 'linkedIn', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="sr-add-btn" onClick={addTeam}>
                <span className="material-symbols-outlined">add</span>
                Add Team Member
              </button>
            </div>
          )}

          {/* ── Step 3: Documents & Pitch ── */}
          {step === 3 && (
            <div className="sr-fields">
              <h3 className="sr-section-title">Documents & Pitch</h3>
              <div className="sr-pitch-modes">
                <div className="sr-pitch-mode-label">Business Pitch</div>
                <div className="sr-field">
                  <label>Pitch / Executive Summary (text)</label>
                  <textarea className="sr-input sr-textarea" rows={5}
                    placeholder="Describe your startup, problem you solve, traction, and why investors should back you…"
                    value={form.pitchText} onChange={e => update('pitchText', e.target.value)}
                  />
                  {form.pitchText && (
                    <div className="sr-ai-badge">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
                      AI will analyze and score this pitch (Pitch Quality Score)
                    </div>
                  )}
                </div>
              </div>
              <div className="sr-row">
                <div className="sr-field">
                  <label>Pitch Deck (PDF / PPTX)</label>
                  <input className="sr-input sr-file-input" type="file" accept=".pdf,.ppt,.pptx"
                    onChange={e => update('pitchDeck', e.target.files[0])} />
                </div>
                <div className="sr-field">
                  <label>Business Plan (PDF)</label>
                  <input className="sr-input sr-file-input" type="file" accept="application/pdf"
                    onChange={e => update('businessPlan', e.target.files[0])} />
                </div>
              </div>
              <div className="sr-info-card">
                <span className="material-symbols-outlined" style={{ color: '#4F46E5', fontSize: 20 }}>auto_awesome</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>AI Pitch Analysis</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
                    TrustBridge AI parses your pitch text and deck to generate a Pitch Quality Score (0–10) and Credibility Index, shown publicly on your profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Funding & Milestones ── */}
          {step === 4 && (
            <div className="sr-fields">
              <h3 className="sr-section-title">Funding Goal & Milestone Plan</h3>
              <div className="sr-row">
                <div className="sr-field">
                  <label>Total Funding Goal (USD) *</label>
                  <input className="sr-input" type="number" placeholder="e.g. 2000000"
                    value={form.fundingGoal} onChange={e => update('fundingGoal', e.target.value)} />
                </div>
                <div className="sr-field">
                  <label>Expected Timeline</label>
                  <select className="sr-input" value={form.timeline} onChange={e => update('timeline', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="6_months">6 months</option>
                    <option value="12_months">12 months</option>
                    <option value="18_months">18 months</option>
                    <option value="24_months">24 months</option>
                    <option value="36_months">36 months</option>
                  </select>
                </div>
              </div>
              <div className="sr-ms-header">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#6366F1' }}>flag</span>
                Milestone Plan
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>
                  Each milestone unlocks a funding tranche via DAO vote
                </span>
              </div>
              {form.milestones.map((ms, i) => (
                <div key={i} className="sr-ms-row">
                  <div className="sr-ms-num">{i + 1}</div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr 80px', gap: 10 }}>
                    <div className="sr-field">
                      <label>Milestone Title</label>
                      <input className="sr-input" placeholder="e.g. MVP Launch"
                        value={ms.title} onChange={e => updateMs(i, 'title', e.target.value)} />
                    </div>
                    <div className="sr-field">
                      <label>Target Date</label>
                      <input className="sr-input" type="date"
                        value={ms.targetDate} onChange={e => updateMs(i, 'targetDate', e.target.value)} />
                    </div>
                    <div className="sr-field">
                      <label>Tranche %</label>
                      <input className="sr-input" type="number" min="1" max="100" placeholder="25"
                        value={ms.tranchePct} onChange={e => updateMs(i, 'tranchePct', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="sr-add-btn" onClick={addMs}>
                <span className="material-symbols-outlined">add</span>
                Add Milestone
              </button>
              <div className="sr-info-card">
                <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: 20 }}>lock</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>Tranche Locking</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
                    Funds are released per milestone only after 60%+ investor DAO approval. Total tranches must sum to 100%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="sr-nav-btns">
            {step > 1 && (
              <button className="sr-btn sr-btn--ghost" onClick={() => setStep(s => s - 1)}>
                ← Previous
              </button>
            )}
            {step < 4
              ? <button className="sr-btn sr-btn--primary" onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && !canNext1}>
                  Next Step →
                </button>
              : <button className="sr-btn sr-btn--primary" onClick={handleSubmit} disabled={loading || !form.fundingGoal}>
                  {loading ? 'Submitting…' : 'Submit Profile for Verification'}
                </button>
            }
          </div>
        </div>

        <p className="sr-login-link">
          Already have an account? <Link to="/auth">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
