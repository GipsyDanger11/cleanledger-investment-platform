import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import './ProfileCompletion.css';

const ENTITY_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'family_office', label: 'Family office' },
  { value: 'vc_fund', label: 'VC fund' },
  { value: 'angel_network', label: 'Angel network' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'company', label: 'Company' },
  { value: 'fund', label: 'Fund' },
  { value: 'spv', label: 'SPV' },
];

const RANGE_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'under_50k', label: 'Under ₹5L' },
  { value: '50k_250k', label: '₹5L – ₹25L' },
  { value: '250k_1m', label: '₹25L – ₹80L' },
  { value: '1m_5m', label: '₹80L – ₹4Cr' },
  { value: 'over_5m', label: 'Over ₹4Cr' },
];

const FOCUS_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'clean_energy', label: 'Clean energy' },
  { value: 'water_tech', label: 'Water tech' },
  { value: 'carbon_markets', label: 'Carbon markets' },
  { value: 'solar_tech', label: 'Solar tech' },
  { value: 'environmental_iot', label: 'Environmental IoT' },
  { value: 'general_esg', label: 'General ESG' },
];

const STEPS = [
  { id: 1, title: 'Firm', desc: 'Entity & contact', icon: 'apartment' },
  { id: 2, title: 'Mandate', desc: 'Range & thesis', icon: 'trending_up' },
  { id: 3, title: 'Track record', desc: 'Portfolio & experience', icon: 'work_history' },
  { id: 4, title: 'Verification', desc: 'LinkedIn & accreditation', icon: 'verified_user' },
];

export default function InvestorProfileCompletion() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);

  const [form, setForm] = useState({
    organization: '',
    entityType: 'individual',
    phone: '',
    investmentRange: '',
    investmentFocus: '',
    geographyFocus: '',
    preferredStages: '',
    portfolioSize: '',
    notablePortfolio: '',
    investmentThesis: '',
    yearsInvesting: '',
    operatorBackground: '',
    linkedIn: '',
    accreditationStatus: '',
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (user.role !== 'investor') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (user.profileComplete) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    apiClient
      .get('/investor-profile/me')
      .then((res) => {
        const d = res.data.data;
        if (!d) return;
        setForm((f) => ({
          ...f,
          organization: d.organization || '',
          entityType: d.entityType || 'individual',
          phone: d.phone || '',
          investmentRange: d.investmentRange || '',
          investmentFocus: d.investmentFocus || '',
          geographyFocus: d.geographyFocus || '',
          preferredStages: Array.isArray(d.preferredStages) ? d.preferredStages.join(', ') : '',
          portfolioSize: d.portfolioSize != null ? String(d.portfolioSize) : '',
          notablePortfolio: d.notablePortfolio || '',
          investmentThesis: d.investmentThesis || '',
          yearsInvesting: d.yearsInvesting != null ? String(d.yearsInvesting) : '',
          operatorBackground: d.operatorBackground || '',
          linkedIn: d.linkedIn || '',
          accreditationStatus: d.accreditationStatus || '',
        }));
        setScore(d.profileCompletionScore || 0);
      })
      .catch(() => {});
  }, []);

  const saveStep = async () => {
    setSaving(true);
    setError('');
    try {
      let body = {};
      if (step === 1) {
        body = {
          organization: form.organization.trim(),
          entityType: form.entityType,
          phone: form.phone.trim(),
        };
      } else if (step === 2) {
        body = {
          investmentRange: form.investmentRange,
          investmentFocus: form.investmentFocus,
          geographyFocus: form.geographyFocus.trim(),
          preferredStages: form.preferredStages
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        };
      } else if (step === 3) {
        body = {
          portfolioSize: form.portfolioSize === '' ? undefined : Number(form.portfolioSize),
          notablePortfolio: form.notablePortfolio.trim(),
          investmentThesis: form.investmentThesis.trim(),
          yearsInvesting: form.yearsInvesting === '' ? undefined : Number(form.yearsInvesting),
          operatorBackground: form.operatorBackground.trim(),
        };
      } else if (step === 4) {
        body = {
          linkedIn: form.linkedIn.trim(),
          accreditationStatus: form.accreditationStatus,
        };
      }

      const { data } = await apiClient.put('/investor-profile/me', body);
      setScore(data.profileCompletionScore ?? data.data?.profileCompletionScore ?? score);

      if (step === 4) {
        const complete = data.profileComplete ?? data.data?.profileComplete;
        const sc = data.profileCompletionScore ?? data.data?.profileCompletionScore ?? 0;
        updateProfile({ profileComplete: complete, profileCompletionScore: sc });
        navigate('/dashboard');
        return;
      }
      setStep((s) => s + 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const canNext =
    (step === 1 && form.organization.trim() && form.entityType) ||
    (step === 2 && form.investmentRange && form.investmentFocus) ||
    (step === 3 &&
      form.notablePortfolio.trim().length > 1 &&
      form.investmentThesis.trim().length > 1 &&
      form.yearsInvesting !== '' &&
      Number(form.yearsInvesting) >= 0) ||
    (step === 4 && form.linkedIn.trim() && form.accreditationStatus);

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-sidebar__logo">
          <div className="profile-sidebar__logo-mark">CL</div>
          <span className="profile-sidebar__logo-text">CleanLedger · Investor</span>
        </div>
        <div className="profile-score">
          <div className="profile-score__circle">
            <svg viewBox="0 0 120 120">
              <circle className="profile-score__bg" cx="60" cy="60" r={r} />
              <circle
                className="profile-score__fill"
                cx="60"
                cy="60"
                r={r}
                strokeDasharray={circ}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="profile-score__value">
              <span className="profile-score__number">{score}</span>
              <span className="profile-score__label">Score</span>
            </div>
          </div>
          <p className="profile-score__text">Investor profile — separate from founder onboarding.</p>
        </div>
        <div className="profile-steps">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`profile-step ${step === s.id ? 'profile-step--active' : ''} ${
                step > s.id ? 'profile-step--completed' : ''
              }`}
              onClick={() => step > s.id && setStep(s.id)}
            >
              <div
                className={`profile-step__indicator ${
                  step === s.id
                    ? 'profile-step__indicator--active'
                    : step > s.id
                      ? 'profile-step__indicator--done'
                      : 'profile-step__indicator--pending'
                }`}
              >
                {step > s.id ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    check
                  </span>
                ) : (
                  s.id
                )}
              </div>
              <div className="profile-step__info">
                <div className="profile-step__title">{s.title}</div>
                <div className="profile-step__desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="profile-skip" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            skip_next
          </span>
          Skip for now
        </button>
      </aside>

      <main className="profile-main">
        <div className="profile-form-card">
          {error && (
            <div className="auth-error" style={{ marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                error
              </span>
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="profile-form__title">Firm & contact</h2>
              <p className="profile-form__subtitle">How you invest — not shared with founder flows.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">Organization / fund name *</label>
                  <input
                    className="profile-field__input"
                    value={form.organization}
                    onChange={(e) => update('organization', e.target.value)}
                    placeholder="e.g. Whitfield Capital Partners"
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Entity type *</label>
                  <select
                    className="profile-field__select"
                    value={form.entityType}
                    onChange={(e) => update('entityType', e.target.value)}
                  >
                    {ENTITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Phone</label>
                  <input
                    className="profile-field__input"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+1 …"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="profile-form__title">Investment mandate</h2>
              <p className="profile-form__subtitle">Typical cheque size and sectors you care about.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">Typical range *</label>
                  <select
                    className="profile-field__select"
                    value={form.investmentRange}
                    onChange={(e) => update('investmentRange', e.target.value)}
                  >
                    {RANGE_OPTIONS.map((o) => (
                      <option key={o.value || 'empty'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Primary focus *</label>
                  <select
                    className="profile-field__select"
                    value={form.investmentFocus}
                    onChange={(e) => update('investmentFocus', e.target.value)}
                  >
                    {FOCUS_OPTIONS.map((o) => (
                      <option key={o.value || 'empty'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Geography focus</label>
                  <input
                    className="profile-field__input"
                    value={form.geographyFocus}
                    onChange={(e) => update('geographyFocus', e.target.value)}
                    placeholder="e.g. EU, India, global"
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Preferred stages (comma-separated)</label>
                  <input
                    className="profile-field__input"
                    value={form.preferredStages}
                    onChange={(e) => update('preferredStages', e.target.value)}
                    placeholder="pre-seed, seed, Series A"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="profile-form__title">Portfolio & experience</h2>
              <p className="profile-form__subtitle">Help founders understand your track record.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">Active portfolio count</label>
                  <input
                    className="profile-field__input"
                    type="number"
                    min="0"
                    value={form.portfolioSize}
                    onChange={(e) => update('portfolioSize', e.target.value)}
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Notable investments *</label>
                  <textarea
                    className="profile-field__textarea"
                    rows={4}
                    value={form.notablePortfolio}
                    onChange={(e) => update('notablePortfolio', e.target.value)}
                    placeholder="Companies or themes you have backed (20+ characters)."
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Investment thesis *</label>
                  <textarea
                    className="profile-field__textarea"
                    rows={4}
                    value={form.investmentThesis}
                    onChange={(e) => update('investmentThesis', e.target.value)}
                    placeholder="What you look for in climate / impact deals."
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Years investing *</label>
                  <input
                    className="profile-field__input"
                    type="number"
                    min="0"
                    value={form.yearsInvesting}
                    onChange={(e) => update('yearsInvesting', e.target.value)}
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Operator / industry background</label>
                  <textarea
                    className="profile-field__textarea"
                    rows={3}
                    value={form.operatorBackground}
                    onChange={(e) => update('operatorBackground', e.target.value)}
                    placeholder="Prior operating roles relevant to your investing."
                  />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="profile-form__title">Verification</h2>
              <p className="profile-form__subtitle">LinkedIn and accreditation for deal access.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">LinkedIn profile *</label>
                  <input
                    className="profile-field__input"
                    value={form.linkedIn}
                    onChange={(e) => update('linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Accreditation *</label>
                  <select
                    className="profile-field__select"
                    value={form.accreditationStatus}
                    onChange={(e) => update('accreditationStatus', e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="accredited">Accredited investor</option>
                    <option value="qualified">Qualified institutional buyer</option>
                    <option value="non_accredited">Non-accredited</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="profile-nav">
            {step > 1 && (
              <button className="profile-nav__btn profile-nav__btn--back" onClick={() => setStep((s) => s - 1)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_back
                </span>{' '}
                Back
              </button>
            )}
            <button
              className="profile-nav__btn profile-nav__btn--next"
              onClick={saveStep}
              disabled={saving || !canNext}
            >
              {saving ? 'Saving…' : step === 4 ? 'Finish profile' : 'Save & continue'}
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
