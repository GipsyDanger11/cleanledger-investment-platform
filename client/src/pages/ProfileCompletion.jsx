import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import './ProfileCompletion.css';

const STARTUP_STEPS = [
  { id: 'basic',   title: 'Basic Info',        desc: 'Name, bio & contact details' },
  { id: 'company', title: 'Company Details',    desc: 'Company info & funding goals' },
  { id: 'team',    title: 'Team & Documents',   desc: 'Team members & verification' },
];

const INVESTOR_STEPS = [
  { id: 'basic',      title: 'Basic Info',            desc: 'Name, bio & contact details' },
  { id: 'investment', title: 'Investment Preferences', desc: 'Focus, ticket size & portfolio' },
  { id: 'docs',       title: 'Verification',          desc: 'KYC documents & LinkedIn' },
];

export default function ProfileCompletion() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(user?.profileCompletionScore || 0);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: '',
    phone: '',
    linkedIn: '',
    organization: user?.organization || '',
    companyName: '',
    sector: '',
    fundingGoal: '',
    stage: '',
    website: '',
    teamMembers: [{ name: '', role: '', linkedIn: '' }],
    investmentFocus: '',
    minTicket: '',
    maxTicket: '',
    portfolioSize: '',
  });

  const role = user?.role || 'investor';
  const steps = role === 'startup' ? STARTUP_STEPS : INVESTOR_STEPS;

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  // SEO
  useEffect(() => {
    document.title = 'Complete Your Profile — CleanLedger';
    return () => { document.title = 'CleanLedger'; };
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Team member management
  const addTeamMember = () => {
    setForm((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', role: '', linkedIn: '' }],
    }));
  };

  const updateTeamMember = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.teamMembers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teamMembers: updated };
    });
  };

  const removeTeamMember = (index) => {
    setForm((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  // Calculate local score preview
  const localScore = useMemo(() => {
    let s = 0;
    if (form.name) s += 10;
    if (role) s += 10;
    if (form.organization || form.companyName) s += 20;
    if (form.linkedIn) s += 15;
    if (role === 'startup') {
      if (form.fundingGoal) s += 10;
      if (form.sector) s += 10;
      if (form.teamMembers.some((t) => t.name)) s += 10;
      s += 0; // docs not uploaded yet = 0
    } else {
      if (form.investmentFocus) s += 10;
      if (form.minTicket || form.maxTicket) s += 10;
      if (form.portfolioSize) s += 10;
    }
    return Math.min(s, 100);
  }, [form, role]);

  useEffect(() => {
    setScore(localScore);
  }, [localScore]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      // Clean up numeric fields
      if (payload.fundingGoal) payload.fundingGoal = Number(payload.fundingGoal);
      if (payload.minTicket) payload.minTicket = Number(payload.minTicket);
      if (payload.maxTicket) payload.maxTicket = Number(payload.maxTicket);
      if (payload.portfolioSize) payload.portfolioSize = Number(payload.portfolioSize);
      // Filter out empty team members
      payload.teamMembers = payload.teamMembers.filter((t) => t.name);

      const { data } = await apiClient.put('/profile/complete', payload);
      if (data.profileCompletionScore) setScore(data.profileCompletionScore);

      // Update auth context
      if (updateProfile && data.user) updateProfile(data.user);
    } catch {
      // Silently fail — mock mode may not have backend
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  // Score circle math
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (score / 100) * circumference;

  if (completed) {
    return (
      <div className="profile-page">
        <div className="profile-sidebar">
          <div className="profile-sidebar__logo">
            <div className="profile-sidebar__logo-mark">CL</div>
            <div className="profile-sidebar__logo-text">CleanLedger</div>
          </div>
        </div>
        <div className="profile-main">
          <div className="profile-form-card">
            <div className="profile-success">
              <div className="profile-success__icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h2 className="profile-success__title">Profile Setup Complete!</h2>
              <p className="profile-success__desc">
                Your profile is {score}% complete. You can always update your details later from Settings.
              </p>
              <button className="profile-success__btn" onClick={handleFinish} id="profile-go-dashboard">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Left Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-sidebar__logo">
          <div className="profile-sidebar__logo-mark">CL</div>
          <div className="profile-sidebar__logo-text">CleanLedger</div>
        </div>

        {/* Score Circle */}
        <div className="profile-score">
          <div className="profile-score__circle">
            <svg viewBox="0 0 120 120">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <circle className="profile-score__bg" cx="60" cy="60" r="52" />
              <circle
                className="profile-score__fill"
                cx="60"
                cy="60"
                r="52"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="profile-score__value">
              <div className="profile-score__number">{score}%</div>
              <div className="profile-score__label">Complete</div>
            </div>
          </div>
          <p className="profile-score__text">
            Complete your profile to unlock<br />full platform features.
          </p>
        </div>

        {/* Steps */}
        <div className="profile-steps">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <div
                key={step.id}
                className={`profile-step ${isActive ? 'profile-step--active' : ''} ${isDone ? 'profile-step--completed' : ''}`}
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
              >
                <div className={`profile-step__indicator ${isDone ? 'profile-step__indicator--done' : isActive ? 'profile-step__indicator--active' : 'profile-step__indicator--pending'}`}>
                  {isDone ? (
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="profile-step__info">
                  <div className="profile-step__title">{step.title}</div>
                  <div className="profile-step__desc">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="profile-skip" onClick={handleSkip} id="profile-skip-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>skip_next</span>
          Skip for now
        </button>
      </div>

      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-form-card">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <>
              <h2 className="profile-form__title">Basic Information</h2>
              <p className="profile-form__subtitle">Tell us about yourself. This helps build trust with other users on the platform.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">Full Name</label>
                  <input className="profile-field__input" type="text" placeholder="John Doe" value={form.name} onChange={(e) => updateField('name', e.target.value)} id="profile-name" />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Bio</label>
                  <textarea className="profile-field__textarea" placeholder="A brief introduction..." value={form.bio} onChange={(e) => updateField('bio', e.target.value)} id="profile-bio" />
                </div>
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Phone</label>
                    <input className="profile-field__input" type="tel" placeholder="+1 555-0123" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} id="profile-phone" />
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">LinkedIn URL</label>
                    <input className="profile-field__input" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={(e) => updateField('linkedIn', e.target.value)} id="profile-linkedin" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 1 for Startup: Company Details */}
          {currentStep === 1 && role === 'startup' && (
            <>
              <h2 className="profile-form__title">Company Details</h2>
              <p className="profile-form__subtitle">Share your startup's details to attract the right investors.</p>
              <div className="profile-form">
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Company Name</label>
                    <input className="profile-field__input" type="text" placeholder="Acme Inc." value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} id="profile-company" />
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Organization</label>
                    <input className="profile-field__input" type="text" placeholder="Parent org (if any)" value={form.organization} onChange={(e) => updateField('organization', e.target.value)} id="profile-org" />
                  </div>
                </div>
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Sector</label>
                    <select className="profile-field__select" value={form.sector} onChange={(e) => updateField('sector', e.target.value)} id="profile-sector">
                      <option value="">Select sector...</option>
                      <option value="Clean Energy">Clean Energy</option>
                      <option value="Water Tech">Water Tech</option>
                      <option value="Solar Tech">Solar Tech</option>
                      <option value="Thermal Storage">Thermal Storage</option>
                      <option value="Carbon Markets">Carbon Markets</option>
                      <option value="Environmental IoT">Environmental IoT</option>
                      <option value="Fintech">Fintech</option>
                      <option value="HealthTech">HealthTech</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Stage</label>
                    <select className="profile-field__select" value={form.stage} onChange={(e) => updateField('stage', e.target.value)} id="profile-stage">
                      <option value="">Select stage...</option>
                      <option value="pre-seed">Pre-Seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="series-c">Series C</option>
                      <option value="growth">Growth</option>
                    </select>
                  </div>
                </div>
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Funding Goal ($)</label>
                    <input className="profile-field__input" type="number" placeholder="500000" value={form.fundingGoal} onChange={(e) => updateField('fundingGoal', e.target.value)} id="profile-funding" />
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Website</label>
                    <input className="profile-field__input" type="url" placeholder="https://acme.com" value={form.website} onChange={(e) => updateField('website', e.target.value)} id="profile-website" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 1 for Investor: Investment Preferences */}
          {currentStep === 1 && role === 'investor' && (
            <>
              <h2 className="profile-form__title">Investment Preferences</h2>
              <p className="profile-form__subtitle">Help us match you with the right startups.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">Investment Focus</label>
                  <input className="profile-field__input" type="text" placeholder="e.g. Clean Energy, SaaS, DeepTech" value={form.investmentFocus} onChange={(e) => updateField('investmentFocus', e.target.value)} id="profile-focus" />
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Organization</label>
                  <input className="profile-field__input" type="text" placeholder="Your firm or fund name" value={form.organization} onChange={(e) => updateField('organization', e.target.value)} id="profile-org" />
                </div>
                <div className="profile-row">
                  <div className="profile-field">
                    <label className="profile-field__label">Min Ticket ($)</label>
                    <input className="profile-field__input" type="number" placeholder="50000" value={form.minTicket} onChange={(e) => updateField('minTicket', e.target.value)} id="profile-min-ticket" />
                  </div>
                  <div className="profile-field">
                    <label className="profile-field__label">Max Ticket ($)</label>
                    <input className="profile-field__input" type="number" placeholder="1000000" value={form.maxTicket} onChange={(e) => updateField('maxTicket', e.target.value)} id="profile-max-ticket" />
                  </div>
                </div>
                <div className="profile-field">
                  <label className="profile-field__label">Portfolio Size (# of companies)</label>
                  <input className="profile-field__input" type="number" placeholder="12" value={form.portfolioSize} onChange={(e) => updateField('portfolioSize', e.target.value)} id="profile-portfolio" />
                </div>
              </div>
            </>
          )}

          {/* Step 2 for Startup: Team */}
          {currentStep === 2 && role === 'startup' && (
            <>
              <h2 className="profile-form__title">Team & Documents</h2>
              <p className="profile-form__subtitle">Add team members and their LinkedIn profiles. Upload verification documents later in Settings.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">Team Members</label>
                  <div className="profile-team-list">
                    {form.teamMembers.map((member, idx) => (
                      <div key={idx} className="profile-team-member">
                        <input type="text" placeholder="Name" value={member.name} onChange={(e) => updateTeamMember(idx, 'name', e.target.value)} />
                        <input type="text" placeholder="Role" value={member.role} onChange={(e) => updateTeamMember(idx, 'role', e.target.value)} />
                        <input type="url" placeholder="LinkedIn URL" value={member.linkedIn} onChange={(e) => updateTeamMember(idx, 'linkedIn', e.target.value)} />
                        {form.teamMembers.length > 1 && (
                          <button className="profile-team-remove" onClick={() => removeTeamMember(idx)} type="button">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="profile-team-add" onClick={addTeamMember} type="button">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                    Add Team Member
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2 for Investor: Verification */}
          {currentStep === 2 && role === 'investor' && (
            <>
              <h2 className="profile-form__title">Verification</h2>
              <p className="profile-form__subtitle">Verify your identity to unlock full platform features. You can upload KYC documents later in Settings.</p>
              <div className="profile-form">
                <div className="profile-field">
                  <label className="profile-field__label">LinkedIn Profile</label>
                  <input className="profile-field__input" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={(e) => updateField('linkedIn', e.target.value)} id="profile-verify-linkedin" />
                </div>
                <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8, color: 'rgba(14,165,233,0.4)' }}>cloud_upload</span>
                  KYC document upload will be available in Settings after account creation.
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="profile-nav">
            {currentStep > 0 && (
              <button className="profile-nav__btn profile-nav__btn--back" onClick={() => setCurrentStep(currentStep - 1)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button className="profile-nav__btn profile-nav__btn--next" onClick={handleNext} disabled={saving}>
                {saving ? 'Saving...' : 'Next'}
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            ) : (
              <button className="profile-nav__btn profile-nav__btn--finish" onClick={handleNext} disabled={saving}>
                {saving ? 'Saving...' : 'Complete Profile'}
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
