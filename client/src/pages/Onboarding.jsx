import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const STEPS = [
  { id: 1, title: 'Initialize Account',    icon: 'person_add',    desc: 'Secure access requires identity verification' },
  { id: 2, title: 'Entity Verification',   icon: 'upload_file',   desc: 'Upload incorporation documents or government-issued ID' },
  { id: 3, title: 'Terms Acceptance',      icon: 'gavel',         desc: 'Terms of Service + Data Processing Agreement' },
  { id: 4, title: 'Authenticate',          icon: 'lock_open',     desc: 'Link to authentication flow' },
];

export default function Onboarding() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', name: '', entityType: 'individual' });
  const [agreed, setAgreed] = useState({ tos: false, dpa: false });
  const [loading, setLoading] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleNext = async () => {
    if (step < 4) { setStep(step + 1); return; }
    setLoading(true);
    await register({ email: form.email, name: form.name, entityType: form.entityType });
    navigate('/dashboard');
  };

  const canProceed = () => {
    if (step === 1) return form.email.includes('@') && form.password.length >= 8 && form.name.trim();
    if (step === 2) return docUploaded;
    if (step === 3) return agreed.tos && agreed.dpa;
    return true;
  };

  return (
    <div className="onboarding">
      {/* Left branding panel */}
      <div className="onboarding__brand">
        <div className="onboarding__brand-inner">
          <Link to="/" className="onboarding__logo">
            <span className="onboarding__logo-mark">CL</span>
            <span className="text-label-md" style={{ color: '#8590A6', fontWeight: 600 }}>CleanLedger</span>
          </Link>

          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <h1 className="text-headline" style={{ color: '#FFFFFF', marginBottom: 'var(--space-4)', maxWidth: '28ch' }}>
              Precision-grade infrastructure for private markets.
            </h1>
            <p className="text-body-md" style={{ color: '#8590A6', maxWidth: '36ch', lineHeight: 1.7 }}>
              Establish absolute clarity over your cap table, investment portfolio, and compliance documentation.
            </p>
          </div>

          {/* Steps list */}
          <div className="onboarding__step-list">
            {STEPS.map((s) => (
              <div key={s.id} className={`onboarding__step-item ${step === s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}>
                <div className="onboarding__step-icon">
                  {step > s.id
                    ? <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check</span>
                    : <span className="text-label-sm">{s.id}</span>
                  }
                </div>
                <div>
                  <p className="text-label-md" style={{ color: step >= s.id ? '#FFFFFF' : '#8590A6', margin: 0 }}>{s.title}</p>
                  <p className="text-label-sm" style={{ color: '#55667A', margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-label-sm" style={{ color: '#55667A', marginTop: 'var(--space-6)' }}>
            Already have an account?{' '}
            <button
              className="btn btn-tertiary"
              style={{ color: 'var(--color-tertiary-fixed)', fontSize: 'inherit', paddingLeft: 0, paddingRight: 0 }}
              onClick={async () => {
                await login('demo@cleanledger.io', 'password');
                navigate('/dashboard');
              }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="onboarding__form-panel">
        <div className="onboarding__form-inner">
          {/* Progress bar */}
          <div className="onboarding__progress">
            <div className="progress-bar" style={{ height: '3px' }}>
              <div className="progress-bar__fill" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
            <span className="text-label-sm text-meta">Step {step} of 4</span>
          </div>

          {/* STEP 1 — Initialize Account */}
          {step === 1 && (
            <div className="onboarding__step-content">
              <div className="onboarding__step-header">
                <span className="material-symbols-outlined onboarding__step-icon-main">person_add</span>
                <h2 className="text-headline">Initialize Account</h2>
                <p className="text-body-md text-secondary">Create your CleanLedger investor account.</p>
              </div>
              <div className="onboarding__fields">
                <div>
                  <label className="input-label" htmlFor="onboard-name">Full Name / Entity Name</label>
                  <input id="onboard-name" className="input" placeholder="James Whitfield" value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
                </div>
                <div>
                  <label className="input-label" htmlFor="onboard-email">Email Address</label>
                  <input id="onboard-email" className="input" type="email" placeholder="james@capital.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                </div>
                <div>
                  <label className="input-label" htmlFor="onboard-password">Passphrase (min. 8 characters)</label>
                  <input id="onboard-password" className="input" type="password" placeholder="••••••••••••" value={form.password} onChange={(e) => updateForm('password', e.target.value)} />
                </div>
                <div>
                  <label className="input-label" htmlFor="onboard-entity">Entity Type</label>
                  <select id="onboard-entity" className="input" value={form.entityType} onChange={(e) => updateForm('entityType', e.target.value)}>
                    <option value="individual">Individual</option>
                    <option value="company">Company / SPV</option>
                    <option value="fund">Fund / Family Office</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Entity Verification */}
          {step === 2 && (
            <div className="onboarding__step-content">
              <div className="onboarding__step-header">
                <span className="material-symbols-outlined onboarding__step-icon-main">upload_file</span>
                <h2 className="text-headline">Entity Verification</h2>
                <p className="text-body-md text-secondary">
                  {form.entityType === 'individual'
                    ? 'Upload a government-issued photo ID (passport, driver\'s licence).'
                    : 'Upload official incorporation documents (Certificate of Incorporation or equivalent).'}
                </p>
              </div>
              <div
                className={`onboarding__upload-zone ${docUploaded ? 'onboarding__upload-zone--done' : ''}`}
                onClick={() => setDocUploaded(true)}
              >
                {docUploaded ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--color-on-tertiary-container)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <p className="text-body-md" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>Document uploaded</p>
                    <p className="text-label-sm text-secondary">Click to replace</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--color-outline)' }}>upload_file</span>
                    <p className="text-body-md" style={{ color: 'var(--color-on-surface)' }}>Drag & drop or <strong style={{ color: 'var(--color-primary-container)' }}>click to upload</strong></p>
                    <p className="text-label-sm text-meta">PDF, JPG, PNG · Max 10MB</p>
                  </>
                )}
              </div>
              <div className="alert-banner">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-on-tertiary-container)', flexShrink: 0 }}>shield</span>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
                  Documents are encrypted at rest and used solely for KYC/AML compliance review.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3 — Terms */}
          {step === 3 && (
            <div className="onboarding__step-content">
              <div className="onboarding__step-header">
                <span className="material-symbols-outlined onboarding__step-icon-main">gavel</span>
                <h2 className="text-headline">Terms Acceptance</h2>
                <p className="text-body-md text-secondary">Please read and accept the following legal agreements.</p>
              </div>
              <div className="onboarding__terms">
                <div className="onboarding__terms-doc card">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-container)' }}>article</span>
                      <div>
                        <p className="text-label-md" style={{ margin: 0, color: 'var(--color-on-surface)' }}>Terms of Service</p>
                        <p className="text-label-sm text-meta" style={{ margin: 0 }}>Platform usage, investor obligations</p>
                      </div>
                    </div>
                    <button className="btn btn-tertiary" style={{ fontSize: '0.7rem' }}>View →</button>
                  </div>
                  <label className="onboarding__checkbox-label">
                    <input type="checkbox" checked={agreed.tos} onChange={(e) => setAgreed((a) => ({ ...a, tos: e.target.checked }))} id="accept-tos" />
                    <span className="text-body-sm">I have read and agree to the Terms of Service</span>
                  </label>
                </div>
                <div className="onboarding__terms-doc card">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-container)' }}>privacy_tip</span>
                      <div>
                        <p className="text-label-md" style={{ margin: 0, color: 'var(--color-on-surface)' }}>Data Processing Agreement</p>
                        <p className="text-label-sm text-meta" style={{ margin: 0 }}>GDPR-compliant personal data handling</p>
                      </div>
                    </div>
                    <button className="btn btn-tertiary" style={{ fontSize: '0.7rem' }}>View →</button>
                  </div>
                  <label className="onboarding__checkbox-label">
                    <input type="checkbox" checked={agreed.dpa} onChange={(e) => setAgreed((a) => ({ ...a, dpa: e.target.checked }))} id="accept-dpa" />
                    <span className="text-body-sm">I acknowledge the Data Processing Agreement (GDPR)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Authenticate */}
          {step === 4 && (
            <div className="onboarding__step-content">
              <div className="onboarding__step-header">
                <span className="material-symbols-outlined onboarding__step-icon-main" style={{ color: 'var(--color-tertiary-fixed)' }}>lock_open</span>
                <h2 className="text-headline">Ready to Authenticate</h2>
                <p className="text-body-md text-secondary">
                  Your identity has been submitted for verification. Access your dashboard to begin investing.
                </p>
              </div>
              <div className="alert-banner">
                <span className="material-symbols-outlined" style={{ color: 'var(--color-on-tertiary-container)', flexShrink: 0 }}>check_circle</span>
                <div>
                  <p className="text-label-md" style={{ color: 'var(--color-on-surface)', margin: 0, fontWeight: 600 }}>Account initialized</p>
                  <p className="text-label-sm text-secondary" style={{ margin: 0 }}>KYC review typically completes within 24 hours.</p>
                </div>
              </div>
              <div className="onboarding__summary card">
                <div className="onboarding__summary-row">
                  <span className="text-label-sm text-meta">Name</span>
                  <span className="text-body-sm">{form.name || 'Not provided'}</span>
                </div>
                <div className="onboarding__summary-row">
                  <span className="text-label-sm text-meta">Email</span>
                  <span className="text-body-sm">{form.email || 'Not provided'}</span>
                </div>
                <div className="onboarding__summary-row">
                  <span className="text-label-sm text-meta">Entity Type</span>
                  <span className="text-body-sm" style={{ textTransform: 'capitalize' }}>{form.entityType}</span>
                </div>
                <div className="onboarding__summary-row">
                  <span className="text-label-sm text-meta">KYC Status</span>
                  <span className="chip chip--filter" style={{ fontSize: '0.6rem' }}>Pending Review</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="onboarding__actions">
            {step > 1 && (
              <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              style={{ marginLeft: 'auto' }}
              id="onboarding-next-btn"
            >
              {loading ? 'Authenticating…' : step === 4 ? 'Enter Dashboard →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
