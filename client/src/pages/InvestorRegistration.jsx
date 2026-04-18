import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './investor.css';

export default function InvestorRegistration() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    organization: '', investmentRange: '', investmentFocus: '',
    linkedIn: '', entityType: 'individual',
    accreditedStatus: '',
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'investor',
        organization: form.organization || undefined,
        entityType: form.entityType,
        investmentFocus: form.investmentFocus || undefined,
        investmentRange: form.investmentRange || undefined,
        linkedIn: form.linkedIn || undefined,
        accreditationStatus: form.accreditedStatus || undefined,
      });
      navigate('/profile-setup');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ['Personal Info', 'Investment Profile', 'KYC & Accreditation'];

  return (
    <div className="ir-page">
      <div className="ir-bg-grid" />

      <Link to="/auth" className="ir-back">
        <span className="material-symbols-outlined">arrow_back</span> Back
      </Link>

      <div className="ir-container">
        {/* Header */}
        <div className="ir-header">
          <div className="ir-header__badge">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <h1 className="ir-header__title">Investor Registration</h1>
          <p className="ir-header__sub">Join TrustBridge as a verified investor</p>
        </div>

        {/* Step indicators */}
        <div className="ir-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`ir-step ${step === i + 1 ? 'ir-step--active' : ''} ${step > i + 1 ? 'ir-step--done' : ''}`}>
              <div className="ir-step__dot">
                {step > i + 1
                  ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                  : i + 1}
              </div>
              <span className="ir-step__label">{s}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="ir-card">
          {error && (
            <div className="ir-error">
              <span className="material-symbols-outlined">error</span> {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="ir-fields">
              <h3 className="ir-section-title">Personal Information</h3>
              <div className="ir-row">
                <div className="ir-field">
                  <label>Full Name *</label>
                  <input className="ir-input" placeholder="James Whitfield"
                    value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="ir-field">
                  <label>Entity Type *</label>
                  <select className="ir-input" value={form.entityType} onChange={e => update('entityType', e.target.value)}>
                    <option value="individual">Individual</option>
                    <option value="family_office">Family Office</option>
                    <option value="vc_fund">VC Fund</option>
                    <option value="angel_network">Angel Network</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>
              <div className="ir-field">
                <label>Email Address *</label>
                <input className="ir-input" type="email" placeholder="you@company.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="ir-row">
                <div className="ir-field">
                  <label>Password *</label>
                  <input className="ir-input" type="password" placeholder="Min. 8 characters"
                    value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
                <div className="ir-field">
                  <label>Confirm Password *</label>
                  <input className="ir-input" type="password" placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                </div>
              </div>
              <div className="ir-field">
                <label>Organization / Fund Name</label>
                <input className="ir-input" placeholder="Whitfield Capital Partners"
                  value={form.organization} onChange={e => update('organization', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Investment Profile */}
          {step === 2 && (
            <div className="ir-fields">
              <h3 className="ir-section-title">Investment Profile</h3>
              <div className="ir-field">
                <label>Typical Investment Range</label>
                <select className="ir-input" value={form.investmentRange} onChange={e => update('investmentRange', e.target.value)}>
                  <option value="">Select range…</option>
                  <option value="under_50k">Under $50K</option>
                  <option value="50k_250k">$50K – $250K</option>
                  <option value="250k_1m">$250K – $1M</option>
                  <option value="1m_5m">$1M – $5M</option>
                  <option value="over_5m">Over $5M</option>
                </select>
              </div>
              <div className="ir-field">
                <label>Investment Focus</label>
                <select className="ir-input" value={form.investmentFocus} onChange={e => update('investmentFocus', e.target.value)}>
                  <option value="">Select sector…</option>
                  <option value="clean_energy">Clean Energy</option>
                  <option value="water_tech">Water Tech</option>
                  <option value="carbon_markets">Carbon Markets</option>
                  <option value="solar_tech">Solar Tech</option>
                  <option value="environmental_iot">Environmental IoT</option>
                  <option value="general_esg">General ESG</option>
                </select>
              </div>
              <div className="ir-field">
                <label>LinkedIn Profile URL</label>
                <input className="ir-input" placeholder="https://linkedin.com/in/username"
                  value={form.linkedIn} onChange={e => update('linkedIn', e.target.value)} />
              </div>
              <div className="ir-info-card">
                <span className="material-symbols-outlined" style={{ color: '#4F46E5', fontSize: 18 }}>shield</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>TrustBridge Verified Investors</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
                    Your investment preference helps us match you with the right startups. All data is kept private.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: KYC */}
          {step === 3 && (
            <div className="ir-fields">
              <h3 className="ir-section-title">KYC & Accreditation</h3>
              <div className="ir-field">
                <label>Accreditation Status</label>
                <select className="ir-input" value={form.accreditedStatus} onChange={e => update('accreditedStatus', e.target.value)}>
                  <option value="">Select…</option>
                  <option value="accredited">Accredited Investor (income/net worth threshold)</option>
                  <option value="qualified">Qualified Institutional Buyer</option>
                  <option value="non_accredited">Non-accredited (limited deal access)</option>
                </select>
              </div>
              <div className="ir-kyc-box">
                <div className="ir-kyc-box__icon">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>KYC/AML Verification</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
                    After registration, our compliance team will reach out to complete identity verification.
                    You can explore the platform while verification is pending.
                  </p>
                </div>
              </div>
              <div className="ir-checklist">
                {['I confirm all information provided is accurate',
                  'I agree to the Terms of Service and Privacy Policy',
                  'I understand investments carry risk of loss'].map((item, i) => (
                  <label key={i} className="ir-check-item">
                    <input type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="ir-nav-btns">
            {step > 1 && (
              <button className="ir-btn ir-btn--ghost" onClick={() => setStep(s => s - 1)}>
                ← Previous
              </button>
            )}
            {step < 3
              ? <button className="ir-btn ir-btn--primary" onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && (!form.name || !form.email || !form.password)}>
                  Next Step →
                </button>
              : <button className="ir-btn ir-btn--primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating Account…' : 'Create Investor Account'}
                </button>
            }
          </div>
        </div>

        <p className="ir-login-link">
          Already have an account? <Link to="/auth">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
